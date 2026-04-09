from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal, Dict, Any, List

class OrderItem(BaseModel):
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

class OrderPayload(BaseModel):
    order_number: str
    status: str
    payment_status: str
    payment_method: Optional[str]
    shipping_method: Optional[str]
    financials: OrderFinancials
    items: List[OrderItem]
    created_at: str

class ChatRequest(BaseModel):
    type: Literal["message", "form_submission"] = "message"
    message: Optional[str] = Field(default=None, max_length=2000, description="User's message")
    form_type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for conversation continuity. Auto-generated if not provided."
    )
    customer_id: Optional[int] = Field(
        default=None,
        description="Customer ID if the user is logged in."
    )

    model_config = {"json_schema_extra": {"example": {
        "type": "message",
        "message": "Where is my order #12345?",
        "session_id": "abc-123",
        "customer_id": 123
    }}}

class Product(BaseModel):
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
    sources: list[str] = []
    escalated: bool = False
    complaint_sent: bool = False
    products: list[Product] = []
    order: OrderPayload | None = None
    quick_replies: list[str] = []
    form: dict | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IngestRequest(BaseModel):
    collection: str = Field(..., description="Collection name: products | faqs | policies")

class HealthResponse(BaseModel):
    status: str
    llm: Optional[str] = None
    qdrant: str
    redis: str
    environment: str
