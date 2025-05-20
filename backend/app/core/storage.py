from pydantic import BaseModel
import base64
import uuid

from app.core.deps import supabase

class ImageUpload(BaseModel):
    file: str  # Base64 encoded file
    file_name: str
    content_type: str

def upload(bucket: str, data: ImageUpload) -> str:
    # Decode base64 file
    file_bytes = base64.b64decode(data.file)

    # Generate unique filename
    file_extension = data.file_name.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    # Upload file to Supabase
    result = supabase.storage.from_(bucket).upload(
        unique_filename,
        file_bytes,
        {"content-type": data.content_type}
    )

    if not result:
        raise Exception("Error uploading to supabase")

    # Get public URL
    image_url = supabase.storage.from_(bucket).get_public_url(unique_filename)

    return image_url


def delete_Image(bucket: str, file_path: str):
    # Delete from Supabase
    result = supabase.storage.from_(bucket).remove([file_path])

    if not result:
        raise Exception("Error deleting to supabase")
