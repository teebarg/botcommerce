from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import Optional, Literal, Dict, Any, List
import uuid
import re

class ChatOrderItem(BaseModel):
    product_id: Optional[int] = None
    name: str
    image: Optional[str]
    quantity: int
    price: float
    subtotal: Optional[float] = 0

class OrderFinancials(BaseModel):
    subtotal: float
    tax: float
    discount: float
    wallet_used: float
    shipping_fee: float
    total: float

class ChatOrder(BaseModel):
    order_number: str
    status: str
    payment_status: str
    payment_method: Optional[str]
    shipping_method: Optional[str]
    financials: OrderFinancials
    items: List[ChatOrderItem]
    created_at: str

_SAFE_MESSAGE_RE = re.compile(r"[<>{}\[\]\\]")  # block prompt injection attempts

class ChatRequest(BaseModel):
    type: Literal["message", "form_submission"] = "message"
    message: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=1000,
        description="User's message",
    )
    form_type: Optional[Literal["escalation_details", "complaint_details", "contact_update"]] = None
    data: Optional[Dict[str, Any]] = None
    session_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        min_length=1,
        max_length=100,
        description="Session ID for conversation continuity. Auto-generated if not provided."
    )
    customer_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Customer ID if the user is logged in."
    )
    app_session_id: str = Field(min_length=1, max_length=100)

    @field_validator("message")
    @classmethod
    def sanitise_message(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        # Block obvious prompt injection characters
        if _SAFE_MESSAGE_RE.search(v):
            v = _SAFE_MESSAGE_RE.sub("", v)
        return v

    @field_validator("session_id", "app_session_id")
    @classmethod
    def sanitise_session_id(cls, v: str) -> str:
        # Only allow alphanumeric, hyphens, underscores
        if not re.match(r"^[a-zA-Z0-9_\-]+$", v):
            raise ValueError("Invalid session ID format")
        return v

    @model_validator(mode="after")
    def validate_message_or_form(self) -> "ChatRequest":
        """Ensure the payload is internally consistent."""
        if self.type == "message" and not self.message:
            raise ValueError("message is required when type is 'message'")
        if self.type == "form_submission" and not self.form_type:
            raise ValueError("form_type is required when type is 'form_submission'")
        if self.type == "form_submission" and not self.data:
            raise ValueError("data is required when type is 'form_submission'")
        return self

    model_config = {"json_schema_extra": {"example": {
        "type": "message",
        "message": "Where is my order #12345?",
        "session_id": "abc-123",
        "customer_id": 123,
        "app_session_id": "app-abc-123",
    }}}

class ChatProduct(BaseModel):
    """
    Product model for chat responses
    """
    id: int
    variant_id: int
    name: str
    sku: str
    price: str
    image_url: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    sources: Optional[list[str]] = []
    escalated: bool = False
    complaint_sent: bool = False
    products: list[ChatProduct] = []
    order: ChatOrder | None = None
    quick_replies: list[str] = []
    form: dict | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IngestRequest(BaseModel):
    collection: str = Field(..., description="Collection name: products | faqs | policies")

class HealthResponse(BaseModel):
    status: str
    checks: dict
