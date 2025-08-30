from fastapi import HTTPException

from app.services.websocket import manager
from app.core.logging import logger
from app.models.generic import UploadStatus

upload_statuses: dict[str, UploadStatus] = {}


async def process_file(file, task_id: str, db, upload_func = None):
    logger.debug("Processing file")
    pass


async def send_status_update(task_id: str):
    await manager.send_to_user(
        user_id=task_id,
        data=upload_statuses.get(task_id).model_dump(),
        message_type="sheet-processor",
    )


async def export(data: list, name: str, email: str, columns: list) -> str:
    # TODO: Implement export to supabase
    pass


async def validate_file(file, size: int = 1.5) -> None:
    if file is None:
        logger.error("Invalid file provided")
        raise HTTPException(status_code=422, detail="No file provided")

    size_in_mb = file.size / 1024 / 1024
    if size_in_mb > size:
        logger.error("Uploaded file is greater than 1.5MB")
        raise HTTPException(
            status_code=422, detail="File size should not be more than 1.5MB"
        )
