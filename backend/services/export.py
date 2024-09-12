import asyncio
import os
from datetime import datetime
from io import BytesIO
from typing import Any, Dict

from fastapi import (
    HTTPException,
)

from api.websocket import manager
from core.deps import (
    SessionDep,
)
from core.logging import logger
from core.utils import generate_data_export_email, send_email
from models.generic import UploadStatus
from services.pd import data_to_csv
from services.storage import upload_to_firebase

upload_statuses: Dict[str, UploadStatus] = {}


async def process_file(file, task_id: str, db: SessionDep, upload_func):
    print("Processing file")
    # chunk_size = 100
    # try:
    #     df = pd.read_excel(BytesIO(file))
    #     total_rows = len(df)
    #     upload_statuses[task_id] = UploadStatus(
    #         total_rows=total_rows, processed_rows=0, status="Processing"
    #     )
    #     await send_status_update(task_id)

    #     for i in range(0, total_rows, chunk_size):
    #         chunk = df.iloc[i : i + chunk_size]
    #         records = chunk.to_dict("records")

    #         await upload_func(db=db, records=records)
    #         upload_statuses[task_id].processed_rows += len(records)
    #         await send_status_update(task_id)
    #         await asyncio.sleep(0.1)  # Allow other tasks to run

    #     if upload_statuses.get(task_id):
    #         upload_statuses[task_id].status = "Completed"
    #     await send_status_update(task_id)
    # except Exception as e:
    #     logger.error(f"Error: {e}")
    #     if upload_statuses.get(task_id):
    #         upload_statuses[task_id].status = f"Error: {str(e)}"
    #         await send_status_update(task_id)


async def send_status_update(task_id: str):
    await manager.broadcast(
        id=task_id,
        data=upload_statuses.get(task_id).model_dump(),
        type="sheet-processor",
    )


async def export(data: list, name: str, bucket: Any, email: str, columns: list) -> str:
    return "https://google.com"
    # Get the current date
    # current_date = datetime.now().strftime("%Y-%m-%d-%H:%M:%S")
    # filename = f"{name}_export_{current_date}.csv"
    # csv = data_to_csv(columns=columns, items=data, filename=filename)
    # file_url = await upload_to_firebase(file_path=csv, bucket=bucket)

    # # Send download link
    # email_data = generate_data_export_email(download_link=file_url)
    # send_email(
    #     email_to=email,
    #     subject=email_data.subject,
    #     html_content=email_data.html_content,
    # )

    # # Clean up
    # os.remove(f"./{filename}")

    # return file_url


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
