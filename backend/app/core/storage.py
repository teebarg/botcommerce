import base64
import uuid

from fastapi import HTTPException

from app.core.deps import supabase
from app.models.generic import ImageUpload
from app.core.logging import logger

def upload(bucket: str, data: ImageUpload) -> str:
    try:
        file_bytes = base64.b64decode(data.file)

        file_extension = data.file_name.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

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


def delete_image(bucket: str, file_path: str):
    result = supabase.storage.from_(bucket).remove([file_path])

    if not result:
        raise Exception("Error deleting to supabase")
