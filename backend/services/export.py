from typing import Any, Dict

from fastapi import (
    HTTPException,
)

from api.websocket import manager
from core.deps import (
    SessionDep,
)
from core.logging import logger
from models.generic import UploadStatus

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
    try:
        return ""
        # # Convert data to CSV
        # df = pd.DataFrame(data, columns=columns)
        # csv_buffer = StringIO()
        # df.to_csv(csv_buffer, index=False)
        # csv_content = csv_buffer.getvalue()

        # # Generate a unique filename
        # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # filename = f"{name}_export_{timestamp}.csv"

        # # Upload to Firebase
        # blob = bucket.blob(f"exports/{filename}")
        # blob.upload_from_string(csv_content, content_type="text/csv")
        # blob.make_public()
        # download_url = blob.public_url

        # # Send email with download link
        # email_data = generate_data_export_email(download_link=download_url)
        # send_email(
        #     email_to=email,
        #     subject=f"{name} Export Ready",
        #     html_content=email_data.html_content,
        # )

        # return download_url
    except Exception as e:
        logger.error(f"Error in export function: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}") from e


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
