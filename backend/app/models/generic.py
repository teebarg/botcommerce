from pydantic import BaseModel, EmailStr


class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: str | int | None = ""
    message: str = "bearer"


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

class MagicLinkPayload(BaseModel):
    email: EmailStr
