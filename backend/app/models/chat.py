from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from prisma.enums import ConversationStatus
from app.models.user import User

class ChatMessage(BaseModel):
    id: int
    content: str
    sender: str
    timestamp: datetime

class Chat(BaseModel):
    id: int
    conversation_uuid: str
    user_id: Optional[int] = None
    user: Optional[User] = None
    status: ConversationStatus
    messages: list[ChatMessage] = []
    started_at: datetime
    last_active: datetime

class PaginatedChats(BaseModel):
    items: list[Chat]
    next_cursor: int | None
    limit: int

class ChatRequest(BaseModel):
    user_message: str
    user_id: Optional[int] = None
    conversation_uuid: Optional[str] = None
