from google.cloud.storage.bucket import Bucket

from core.logging import logger


async def upload_to_firebase(file_path: str, bucket: Bucket) -> str:
    try:
        blob = bucket.blob(f"docs/{file_path}")
        blob.upload_from_filename(file_path)
        blob.make_public()
        return blob.public_url
    except Exception as e:
        logger.error(f"Error uploading to Firebase: {e}")
        raise Exception(str(e)) from e
