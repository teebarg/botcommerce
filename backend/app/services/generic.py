from typing import Union, List
from firebase_admin import storage as fb_storage
from app.core.logging import get_logger
from app.core.deps import supabase
import urllib.parse
from typing import List, Union

logger = get_logger(__name__)

async def delete_images(images: Union[str, List[str]]):
    """
    Deletes images from Supabase or Firebase depending on the URL.

    Args:
        images (str | list[str]): Image URL or list of image URLs
    """
    if isinstance(images, str):
        images = [images]  # normalize to list

    supabase_paths = []
    firebase_paths = []

    for img in images:
        if not img:
            continue

        if "/storage/v1/object/public/product-images/" in img:
            # Supabase public URL → extract relative path
            supabase_paths.append(
                img.split("/storage/v1/object/public/product-images/")[1]
            )
        elif "firebasestorage.googleapis.com" in img:
            try:
                # Extract path after `/o/` and before `?`
                parts = img.split("/o/")[-1].split("?")[0]
                # Decode all URL encodings like %20 → space
                firebase_paths.append(urllib.parse.unquote(parts))
            except Exception as e:
                logger.error(f"Failed to parse Firebase URL {img}: {e}")
        else:
            logger.warning(f"Unknown storage provider for image: {img}")

    # Delete Supabase images in bulk
    if supabase_paths and supabase:
        try:
            supabase.storage.from_("product-images").remove(supabase_paths)
            logger.info(f"Deleted {len(supabase_paths)} Supabase images")
        except Exception as e:
            logger.error(f"Error deleting Supabase images: {e}")

    if firebase_paths:
        bucket = fb_storage.bucket()
        for path in firebase_paths:
            try:
                blob = bucket.blob(path)
                blob.delete()
                logger.info(f"Deleted Firebase image: {path}")
            except Exception as e:
                logger.error(f"Error deleting Firebase image {path}: {e}")
