from core.notifications.events.order_created import OrderCreated
from core.notifications.events.test_created import TestCreated
from core.notifications.events.welcome import Welcome
from core.notifications.events.payment_receipt import PaymentReceipt
from core.notifications.events.referral_cashback import ReferralCashback
from core.notifications.events.contact_form import ContactForm
from core.notifications.events.abandoned_cart import AbandonedCartEvent
from core.notifications.events.bulk_purchase import BulkPurchaseEvent
from core.notifications.events.newsletter import NewsletterEvent

__all__ = [
    "OrderCreated",
    "TestCreated",
    "Welcome",
    'PaymentReceipt',
    'ReferralCashback',
    "ContactForm",
    "AbandonedCartEvent",
    "BulkPurchaseEvent",
    "NewsletterEvent"
]
