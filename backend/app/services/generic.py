from typing import Union, List
from app.core.logging import get_logger
from app.core.deps import supabase
import urllib.parse
import re
import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

logger = get_logger(__name__)

async def remove_image_from_storage(images: Union[str, List[str]]):
    """
    Deletes images from Supabase, Firebase, or Cloudinary depending on the URL.

    Args:
        images (str | list[str]): Image URL or list of image URLs
    """
    if isinstance(images, str):
        images = [images]  # normalize to list

    supabase_paths = []
    firebase_paths = []
    cloudinary_ids = []

    for img in images:
        if not img:
            continue

        if "/storage/v1/object/public/product-images/" in img:
            supabase_paths.append(
                img.split("/storage/v1/object/public/product-images/")[1]
            )

        elif "firebasestorage.googleapis.com" in img:
            try:
                parts = img.split("/o/")[-1].split("?")[0]
                firebase_paths.append(urllib.parse.unquote(parts))
            except Exception as e:
                logger.error(f"Failed to parse Firebase URL {img}: {e}")

        elif "res.cloudinary.com" in img:
            try:
                # Extract public_id from Cloudinary URL
                match = re.search(r"/upload/[^/]+/(.+)\.[a-zA-Z0-9]+$", img)
                if match:
                    public_id = match.group(1)
                    cloudinary_ids.append(public_id)
                else:
                    logger.warning(f"Could not parse Cloudinary URL: {img}")
            except Exception as e:
                logger.error(f"Failed to parse Cloudinary URL {img}: {e}")

        else:
            logger.warning(f"Unknown storage provider for image: {img}")

    if supabase_paths and supabase:
        try:
            supabase.storage.from_("product-images").remove(supabase_paths)
            logger.info(f"Deleted {len(supabase_paths)} Supabase images")
        except Exception as e:
            logger.error(f"Error deleting Supabase images: {e}")

    if firebase_paths:
        logger.info(f"Delete Firebase images: {firebase_paths}")
        # bucket = fb_storage.bucket()
        # for path in firebase_paths:
        #     try:
        #         blob = bucket.blob(path)
        #         blob.delete()
        #         logger.info(f"Deleted Firebase image: {path}")
        #     except Exception as e:
        #         logger.error(f"Error deleting Firebase image {path}: {e}")

    if cloudinary_ids:
        for public_id in cloudinary_ids:
            try:
                cloudinary.uploader.destroy(public_id)
                logger.info(f"Deleted Cloudinary image: {public_id}")
            except Exception as e:
                logger.error(f"Error deleting Cloudinary image {public_id}: {e}")
