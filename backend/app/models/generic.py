from pydantic import BaseModel, EmailStr
from typing import Optional


class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: str | int | None = ""
    message: str = "bearer"


class BulkPurchaseCreate(BaseModel):
    name: str
    email: str
    phone: str
    bulkType: str
    quantity: str | None = None
    message: str | None = None


class NewsletterCreate(BaseModel):
    email: str


class UploadStatus(BaseModel):
    total_rows: int
    processed_rows: int
    status: str

# Contents of JWT token
class TokenPayload(BaseModel):
    sub: str | None = None


class Message(BaseModel):
    message: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ImageUpload(BaseModel):
    file: str  # Base64 encoded file
    file_name: str
    content_type: str

class ImageBulkDelete(BaseModel):
    files: list[int]
