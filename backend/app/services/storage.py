from typing import Union, List, Literal, Optional
import urllib.parse
import re
import base64
import uuid
import cloudinary
import cloudinary.uploader
import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from fastapi import HTTPException
from supabase import create_client, Client
from app.core.config import settings
from app.core.logging import get_logger
from app.models.generic import ImageUpload
from app.core.logging import logger

logger = get_logger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

StorageProvider = Literal["supabase", "r2"]

DEFAULT_PROVIDER: StorageProvider = getattr(settings, "DEFAULT_STORAGE_PROVIDER", "supabase")
STORAGE_BUCKET: str = settings.STORAGE_BUCKET
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB per image

# Lazily built + cached — avoids crashing at import time if R2 env vars aren't set.
_r2_client = None
_r2_configured: Optional[bool] = None


def _r2_is_configured() -> bool:
    global _r2_configured
    if _r2_configured is None:
        _r2_configured = bool(
            getattr(settings, "CLOUDFLARE_ACCOUNT_ID", None)
            and getattr(settings, "CLOUDFLARE_R2_ACCESS_KEY_ID", None)
            and getattr(settings, "CLOUDFLARE_R2_SECRET_ACCESS_KEY", None)
        )
        if not _r2_configured:
            logger.warning(
                "Cloudflare R2 credentials not configured — R2 storage disabled.")
    return _r2_configured


def _get_r2_client():
    global _r2_client
    if not _r2_is_configured():
        raise HTTPException(
            status_code=503, detail="Cloudflare R2 is not configured on this server")
    if _r2_client is None:
        _r2_client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            config=BotoConfig(signature_version="s3v4"),
            region_name="auto",
        )
    return _r2_client


class MediaStorageService:

    # ------------------------------------------------------------------
    # Generic entrypoints — call these from the rest of the app.
    # ------------------------------------------------------------------

    def upload(self, bucket: str, data: ImageUpload, provider: Optional[StorageProvider] = None) -> str:
        provider = provider or DEFAULT_PROVIDER
        if provider == "r2":
            return self.upload_r2(bucket, data)
        return self._upload_supabase(bucket, data)

    def upload_file(
        self,
        bucket: str,
        filename: str,
        bytes_data: bytes,
        content_type: str,
        provider: Optional[StorageProvider] = None,
    ) -> str:
        provider = provider or DEFAULT_PROVIDER
        if provider == "r2":
            return self.upload_file_r2(bucket, filename, bytes_data, content_type)
        return self._upload_file_supabase(bucket, filename, bytes_data, content_type)

    def delete_file(self, bucket: str, filename: str, provider: Optional[StorageProvider] = None) -> bool:
        provider = provider or DEFAULT_PROVIDER
        if provider == "r2":
            return self.delete_file_r2(bucket, filename)
        return self._delete_file_supabase(bucket, filename)

    def get_public_url(self, bucket: str, filename: str, provider: Optional[StorageProvider] = None) -> str:
        provider = provider or DEFAULT_PROVIDER
        if provider == "r2":
            return self.get_public_url_r2(bucket, filename)
        return self._get_public_url_supabase(bucket, filename)

    # ------------------------------------------------------------------
    # Supabase
    # ------------------------------------------------------------------

    def _upload_supabase(self, bucket: str, data: ImageUpload) -> str:
        try:
            file_bytes = base64.b64decode(data.file)

            file_extension: str = data.file_name.split('.')[-1]
            unique_filename: str = f"{uuid.uuid4()}.{file_extension}"

            result = supabase.storage.from_(bucket).upload(
                unique_filename,
                file_bytes,
                {"content-type": data.content_type}
            )

            if not result:
                raise Exception("Error uploading to supabase")

            return supabase.storage.from_(bucket).get_public_url(unique_filename)
        except Exception as e:
            logger.error(f"Error uploading to supabase: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e

    def delete_image(self, bucket: str, file_path: str):
        result = supabase.storage.from_(bucket).remove([file_path])

        if not result:
            raise Exception("Error deleting to supabase")

    def _upload_file_supabase(self, bucket: str, filename: str, bytes_data: bytes, content_type: str) -> str:
        """
        Uploads then returns the PUBLIC URL string.
        """
        try:
            result = supabase.storage.from_(bucket).upload(
                filename, bytes_data, {"contentType": content_type}
            )
            if not result:
                raise Exception("Error uploading to supabase")

            return supabase.storage.from_(bucket).get_public_url(filename)
        except Exception as e:
            logger.error(f"Error uploading file to supabase: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e

    def _delete_file_supabase(self, bucket: str, filename: str) -> bool:
        """
        Returns True/False
        """
        try:
            result = supabase.storage.from_(bucket).remove([filename])
            return bool(result)
        except Exception as e:
            logger.error(f"Error deleting file from supabase: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e

    def _get_public_url_supabase(self, bucket: str, filename: str) -> str:
        return supabase.storage.from_(bucket).get_public_url(filename, {"download": filename})

    # ------------------------------------------------------------------
    # Cloudflare R2
    # ------------------------------------------------------------------

    def upload_r2(self, bucket: str, data: ImageUpload) -> str:
        client = _get_r2_client()
        try:
            file_bytes = base64.b64decode(data.file)
            file_extension: str = data.file_name.split('.')[-1]
            unique_filename: str = f"{uuid.uuid4()}.{file_extension}"

            client.put_object(
                Bucket=bucket,
                Key=unique_filename,
                Body=file_bytes,
                ContentType=data.content_type,
            )

            return self.get_public_url_r2(bucket, unique_filename)
        except ClientError as e:
            logger.error(f"Error uploading to R2: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e

    def upload_file_r2(self, bucket: str, filename: str, bytes_data: bytes, content_type: str) -> str:
        client = _get_r2_client()
        try:
            client.put_object(
                Bucket=bucket,
                Key=filename,
                Body=bytes_data,
                ContentType=content_type,
            )
            return self.get_public_url_r2(bucket, filename)
        except ClientError as e:
            logger.error(f"Error uploading file to R2: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e

    def delete_file_r2(self, bucket: str, filename: str) -> bool:
        client = _get_r2_client()
        try:
            client.delete_object(Bucket=bucket, Key=filename)
            return True
        except ClientError as e:
            logger.error(f"Error deleting from R2: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e

    def get_public_url_r2(self, bucket: str, filename: str) -> str:
        if not getattr(settings, "CLOUDFLARE_R2_PUBLIC_URL", None):
            raise HTTPException(
                status_code=503, detail="CLOUDFLARE_R2_PUBLIC_URL is not configured")
        return f"{settings.CLOUDFLARE_R2_PUBLIC_URL}/{filename}"

    # ------------------------------------------------------------------

    async def remove_images(self, images: Union[str, List[str]]) -> list[str]:
        """Returns list of image URLs that failed to delete from storage."""
        if isinstance(images, str):
            images = [images]

        failed: list[str] = []
        supabase_paths, firebase_paths, cloudinary_map, r2_keys = [], [], {}, []

        r2_public_url = getattr(settings, "CLOUDFLARE_R2_PUBLIC_URL", None)

        for img in images:
            if not img:
                continue
            if f"/storage/v1/object/public/{STORAGE_BUCKET}/" in img:
                supabase_paths.append(
                    img.split(f"/storage/v1/object/public/{STORAGE_BUCKET}/")[1])
            elif "firebasestorage.googleapis.com" in img or "storage.googleapis.com" in img:
                try:
                    parts = img.split("/o/")[-1].split("?")[0]
                    firebase_paths.append(urllib.parse.unquote(parts))
                except Exception as e:
                    logger.error(f"Failed parsing Firebase/GCS URL: {e}")
                    failed.append(img)
            elif "res.cloudinary.com" in img:
                match = re.search(r"/upload/[^/]+/(.+)\.[a-zA-Z0-9]+$", img)
                if match:
                    cloudinary_map[match.group(1)] = img
                else:
                    logger.warning(f"Invalid Cloudinary URL: {img}")
                    failed.append(img)
            elif r2_public_url and img.startswith(r2_public_url):
                r2_keys.append(img[len(r2_public_url):].lstrip("/"))

        if supabase_paths and supabase:
            try:
                supabase.storage.from_(STORAGE_BUCKET).remove(supabase_paths)
            except Exception as e:
                logger.error(f"Supabase delete failed: {e}")
                failed.extend(supabase_paths)

        for cid, original_url in cloudinary_map.items():
            try:
                cloudinary.uploader.destroy(cid)
            except Exception as e:
                logger.error(f"Cloudinary delete failed for {cid}: {e}")
                failed.append(original_url)

        if r2_keys:
            if not _r2_is_configured():
                logger.error(
                    "R2 keys found for deletion but R2 is not configured; skipping.")
                failed.extend([f"{r2_public_url}/{k}" for k in r2_keys])
            else:
                try:
                    _get_r2_client().delete_objects(
                        Bucket=settings.STORAGE_BUCKET,
                        Delete={"Objects": [{"Key": k} for k in r2_keys]},
                    )
                except ClientError as e:
                    logger.error(f"R2 delete failed: {e}")
                    failed.extend([f"{r2_public_url}/{k}" for k in r2_keys])

        if firebase_paths:
            logger.debug(
                f"Firebase deletion not implemented: {firebase_paths}")

        return failed