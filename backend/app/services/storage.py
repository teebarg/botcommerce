from typing import Union, List
import urllib.parse
import re
import cloudinary
import cloudinary.uploader
import base64
import uuid

from fastapi import HTTPException
from app.core.config import settings
from supabase import create_client, Client
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


class MediaStorageService:

    def upload(self, bucket: str, data: ImageUpload) -> str:
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

            image_url = supabase.storage.from_(bucket).get_public_url(unique_filename)

            return image_url
        except Exception as e:
            logger.error(f"Error uploading to supabase: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e)) from e


    def delete_image(self, bucket: str, file_path: str):
        result = supabase.storage.from_(bucket).remove([file_path])

        if not result:
            raise Exception("Error deleting to supabase")

    def upload_file(self, bucket: str, filename: str, bytes, content_type: str):
        return supabase.storage.from_(bucket).upload(filename, bytes, {"contentType": content_type})

    def get_public_url(self, bucket: str, filename: str):
        return supabase.storage.from_(bucket).get_public_url(filename, {"download": filename})

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