from pydantic import BaseModel, Field
from datetime import datetime
from typing import  Optional


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for conversation continuity. Auto-generated if not provided."
    )
    customer_id: Optional[str] = Field(
        default=None,
        description="Customer ID from shop, if the user is logged in."
    )

    model_config = {"json_schema_extra": {"example": {
        "message": "Where is my order #12345?",
        "session_id": "abc-123",
        "customer_id": "cust-456"
    }}}

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    sources: list[str] = []
    escalated: bool = False
    products: list[dict] = []
    quick_replies: list[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IngestRequest(BaseModel):
    collection: str = Field(..., description="Collection name: products | faqs | policies")

class HealthResponse(BaseModel):
    status: str
    llm: Optional[str] = None
    qdrant: str
    redis: str
    environment: str
