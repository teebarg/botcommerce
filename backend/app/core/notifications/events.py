from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class BaseNotificationEvent:
    """All events inherit from this."""
    pass


@dataclass
class OrderConfirmedEvent(BaseNotificationEvent):
    order: Dict
    user: Dict
    order_link: str
    items_overview: str
    cc_list: List[str]

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

@dataclass
class InvoiceEvent(BaseNotificationEvent):
    order: Dict
    cc_list: List[str]
