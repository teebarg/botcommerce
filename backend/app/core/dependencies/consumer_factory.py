from app.core.notifications.service import NotificationService
from app.core.dependencies.product import get_product_service
from app.core.dependencies.cart import get_cart_service
from app.core.dependencies.services import get_shop_settings_service, get_storage_service
from app.services.search import SearchService
from app.services.cache import CacheService
from app.services.shop_settings import ShopSettingsService
from app.core.dependencies.cache import get_cache_service
from app.core.dependencies.product import get_search_service
from app.services.order import OrderService
from app.core.notifications.setup import get_notification_service
from app.core.dependencies.services import get_coupon_service, get_event_bus
from prisma import Prisma


def consumer_factory(db_instance: Prisma) -> tuple[OrderService, SearchService, CacheService, ShopSettingsService, NotificationService]:
    """
    Returns a completely hydrated order service alongside fresh 
    sub-service instances isolated to this specific execution run.
    """
    cache_srv = get_cache_service()
    event_bus = get_event_bus()
    search_srv = get_search_service()
    notification_srv = get_notification_service()
    settings_srv = get_shop_settings_service()
    coupon_srv = get_coupon_service()
    storage_srv = get_storage_service()
    
    product_srv = get_product_service(cache_srv=cache_srv, search_srv=search_srv)
    cart_srv = get_cart_service(cache_srv=cache_srv, settings_srv=settings_srv, coupon_srv=coupon_srv)
    
    order_srv = OrderService(
        db=db_instance,
        cart_srv=cart_srv,
        product_srv=product_srv,
        coupon_srv=coupon_srv,
        settings_srv=settings_srv,
        notification_dispatcher=notification_srv,
        event_bus=event_bus,
        cache_srv=cache_srv,
        storage_srv=storage_srv
    )
    
    # Return everything needed for the event execution context
    return order_srv, search_srv, cache_srv, settings_srv, notification_srv