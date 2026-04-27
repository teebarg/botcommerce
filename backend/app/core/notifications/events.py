from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class BaseNotificationEvent:
    """All events inherit from this."""
    pass


@dataclass
class OrderConfirmedEvent(BaseNotificationEvent):
    order_id: int
    user_email: str
    user_phone: Optional[str] = None
    user_name: Optional[str] = None
    order_total: Optional[float] = None


@dataclass
class OrderShippedEvent(BaseNotificationEvent):
    order_id: int
    user_email: str
    user_phone: Optional[str] = None
    tracking_number: Optional[str] = None


@dataclass
class PasswordResetEvent(BaseNotificationEvent):
    user_email: str
    reset_link: str
    user_name: Optional[str] = None


@dataclass
class SendAbandonedCartEvent(BaseNotificationEvent):
    cart: Dict
    user_email: str
    user_name: str
    subscriptions: List[Dict]


@dataclass
class SendPushNotificationEvent(BaseNotificationEvent):
    subscriptions: List[Dict]
    notification: Dict