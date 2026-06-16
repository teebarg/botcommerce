from dataclasses import dataclass
from typing import Dict, List

from app.models.order import Order
from app.models.cart import Cart


@dataclass
class BaseNotificationEvent:
    """All events inherit from this."""
    pass


@dataclass
class OrderConfirmedEvent(BaseNotificationEvent):
    order: Order
    user: Dict
    order_link: str
    items_overview: str
    cc_list: List[str]

@dataclass
class SendAbandonedCartEvent(BaseNotificationEvent):
    cart: Cart
    user_email: str
    user_name: str
    subscriptions: List[Dict]


@dataclass
class SendPushNotificationEvent(BaseNotificationEvent):
    subscriptions: List[Dict]
    notification: Dict

@dataclass
class SendInvoiceEvent(BaseNotificationEvent):
    order: Order
    cc_list: List[str]
