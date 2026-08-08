from pydantic import BaseModel


class UploadStatus(BaseModel):
    total_rows: int
    processed_rows: int
    status: str

# Contents of JWT token
class TokenPayload(BaseModel):
    sub: str | None = None


class Message(BaseModel):
    message: str


class ImageUpload(BaseModel):
    file: str  # Base64 encoded file
    file_name: str
    content_type: str

class ImageBulkDelete(BaseModel):
    files: list[int]
