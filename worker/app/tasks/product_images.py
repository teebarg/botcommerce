import io
import time
import uuid
import httpx
from PIL import Image, ImageOps
from core.logging import get_logger
from core.storage import MediaStorageService
from app.security import call_internal_backend

logger = get_logger(__name__)

MAX_DIMENSION = 2000
WEBP_QUALITY = 82

storage = MediaStorageService()


def optimize_image(file_bytes: bytes, content_type: str) -> tuple[bytes, str, str]:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image = ImageOps.exif_transpose(image)

        if image.mode in ("RGBA", "LA", "P"):
            has_alpha = image.mode in ("RGBA", "LA") or (
                image.mode == "P" and image.info.get("transparency") is not None
            )
            if content_type == "image/png" and has_alpha:
                image = image.convert("RGBA")
            else:
                background = Image.new("RGB", image.size, (255, 255, 255))
                rgba = image.convert("RGBA")
                background.paste(rgba, mask=rgba.split()[-1])
                image = background
        else:
            image = image.convert("RGB")

        if max(image.size) > MAX_DIMENSION:
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

        output = io.BytesIO()
        image.save(output, format="WEBP", quality=WEBP_QUALITY, method=6)

        return output.getvalue(), "image/webp", "webp"
    except Exception as e:
        logger.warning(f"Image optimization failed, using original: {e}")
        ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}.get(
            content_type, "jpg"
        )
        return file_bytes, content_type, ext


async def optimize_product_image(
    ctx,
    image_id: int,
    image_url: str,
    bucket: str,
    storage_key: str,
    content_type: str,
    provider: str | None = None,
):
    """
    arq task: given an already-created ProductImage row (image_id) pointing
    at the raw uploaded file, download it, optimize it, upload the optimized
    version under a new key, tell the backend to swap `image` to the new URL
    via the signed internal relay, then delete the original raw file.

    The product already displays the raw image the moment it's uploaded —
    this just silently swaps it for a smaller version shortly after.
    """
    # 1. Download the raw file we just uploaded
    # raw_url = storage.get_public_url(bucket, storage_key, provider=provider)
    with httpx.Client(timeout=15) as client:
        resp = client.get(image_url)
        resp.raise_for_status()
        raw_bytes = resp.content

    # 2. Optimize
    optimized_bytes, final_content_type, extension = optimize_image(raw_bytes, content_type)

    # If optimization produced the same bytes back (fallback path on error),
    # there's nothing to swap — bail out early.
    if optimized_bytes == raw_bytes:
        logger.info(f"Image {image_id} unchanged by optimization, skipping swap.")
        return {"image_id": image_id, "swapped": False}

    # 3. Upload optimized version under a new key (keep raw as backup until confirmed)
    unique_suffix = uuid.uuid4().hex[:8]
    base_key = storage_key.rsplit(".", 1)[0]
    optimized_key = f"{base_key}-opt-{unique_suffix}.{extension}"

    new_image_url = storage.upload_file(
        bucket=bucket,
        filename=optimized_key,
        bytes_data=optimized_bytes,
        content_type=final_content_type,
        provider=provider,
    )

    # 4. Tell the backend to swap ProductImage.image to the new URL
    await call_internal_backend(
        path=f"/internal/product-images/{image_id}",
        label=f"Image optimization",
        json_body={"image_id": image_id, "image": new_image_url}
    )

    # 5. Now that the swap is confirmed, delete the original raw file.
    # Small retry-with-backoff since this is the one step that, if it silently
    # fails, leaves an orphaned file in storage forever with nothing to catch it.
    _delete_with_retry(storage, bucket, storage_key, provider)

    return {"image_id": image_id, "swapped": True, "image": new_image_url}


def _delete_with_retry(
    storage: MediaStorageService,
    bucket: str,
    key: str,
    provider: str | None,
    attempts: int = 3,
    base_delay_seconds: float = 1.0,
) -> None:
    """Best-effort delete with a few retries. If all attempts fail, just log
    it — the swap already succeeded, so this is a storage-cleanup nicety,
    not something worth failing the job or retrying via arq for."""
    for attempt in range(1, attempts + 1):
        try:
            storage.delete_file(bucket, key, provider=provider)
            return
        except Exception as e:
            if attempt == attempts:
                logger.warning(
                    f"Failed to delete raw file {key} after {attempts} attempts: {e}"
                )
            else:
                time.sleep(base_delay_seconds * attempt)  # 1s, then 2s