from pydantic import BaseModel
from prisma.enums import ConversationStatus
from datetime import datetime
from typing import Optional
from app.models.user import MiniUser

class ChatMessage(BaseModel):
    id: int
    content: str
    sender: str
    metadata: Optional[dict] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class Chat(BaseModel):
    id: int
    conversation_uuid: str
    user_id: Optional[int] = None
    user: Optional[MiniUser] = None
    support_id: Optional[int] = None
    support_name: Optional[str] = None
    status: ConversationStatus
    messages: list[ChatMessage] = []
    is_escalated: bool = False
    human_connected: bool = False
    started_at: datetime
    last_active: datetime

    class Config:
        from_attributes = True

class PaginatedChats(BaseModel):
    items: list[Chat]
    next_cursor: int | None
    limit: int

class ChatRequest(BaseModel):
    message: str
    conversation_uuid: str

class ChatHandoffRequest(BaseModel):
    conversation_uuid: str

class ChatCloseRequest(BaseModel):
    conversation_uuid: str
    status: ConversationStatus
