from dataclasses import dataclass
from typing import Dict, List

from app.models.order import Order


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
class SendPushNotificationEvent(BaseNotificationEvent):
    subscriptions: List[Dict]
    notification: Dict
