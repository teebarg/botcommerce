from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from prisma.enums import ConversationStatus
from app.models.user import User

class ChatMessage(BaseModel):
    id: int
    content: str
    sender: str
    metadata: Optional[dict] = None
    timestamp: datetime

class Chat(BaseModel):
    id: int
    conversation_uuid: str
    user_id: Optional[int] = None
    user: Optional[User] = None
    support_id: Optional[int] = None
    support_name: Optional[str] = None
    status: ConversationStatus
    messages: list[ChatMessage] = []
    is_escalated: bool = False
    human_connected: bool = False
    started_at: datetime
    last_active: datetime

class PaginatedChats(BaseModel):
    items: list[Chat]
    next_cursor: int | None
    limit: int

class ChatRequest(BaseModel):
    message: str
    # user_id: Optional[int] = None
    conversation_uuid: str
    # session_id: Optional[str] = None
    # customer_id: Optional[str] = None

class ChatHandoffRequest(BaseModel):
    conversation_uuid: str
