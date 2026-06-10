from typing import Union, List
import urllib.parse
import re

import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.core.logging import get_logger
from app.core.deps import supabase

logger = get_logger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


class MediaStorageService:

    async def remove_images(self, images: Union[str, List[str]]) -> None:
        if isinstance(images, str):
            images = [images]

        supabase_paths = []
        firebase_paths = []
        cloudinary_ids = []

        for img in images:
            if not img:
                continue

            # Supabase
            if "/storage/v1/object/public/product-images/" in img:
                supabase_paths.append(
                    img.split("/storage/v1/object/public/product-images/")[1]
                )

            # Firebase / GCS
            elif "firebasestorage.googleapis.com" in img or "storage.googleapis.com" in img:
                try:
                    parts = img.split("/o/")[-1].split("?")[0]
                    firebase_paths.append(urllib.parse.unquote(parts))
                except Exception as e:
                    logger.error(f"Failed parsing Firebase/GCS URL: {e}")

            # Cloudinary
            elif "res.cloudinary.com" in img:
                match = re.search(r"/upload/[^/]+/(.+)\.[a-zA-Z0-9]+$", img)
                if match:
                    cloudinary_ids.append(match.group(1))
                else:
                    logger.warning(f"Invalid Cloudinary URL: {img}")

        # Supabase delete
        if supabase_paths and supabase:
            try:
                supabase.storage.from_("product-images").remove(supabase_paths)
            except Exception as e:
                logger.error(f"Supabase delete failed: {e}")

        # Cloudinary delete
        for cid in cloudinary_ids:
            try:
                cloudinary.uploader.destroy(cid)
            except Exception as e:
                logger.error(f"Cloudinary delete failed: {e}")

        # Firebase is ignored (log only)
        if firebase_paths:
            logger.debug(f"Firebase deletion not implemented: {firebase_paths}")