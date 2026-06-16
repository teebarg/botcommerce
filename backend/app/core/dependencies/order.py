from app.core.dependencies.services import get_shop_settings_service
from app.services.search import SearchService
from app.services.cache import CacheService
from app.services.cart import CartService
from app.services.shop_settings import ShopSettingsService
from app.services.product import ProductService
from typing import Annotated
from fastapi import Depends
from app.services.events import EventBus
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.cart import CartDep
from app.core.dependencies.product import ProductDep
from app.prisma_client import prisma as db
from app.services.coupon import CouponService
from app.repositories.order import OrderRepository
from app.services.order import OrderService
from app.core.notifications.setup import get_notification_service
from app.core.dependencies.services import SettingsDep, get_coupon_service, get_event_bus
from app.redis_client import redis_client
from prisma import Prisma

def get_order_repository() -> OrderRepository:
    return OrderRepository(db=db)

def get_order_service(
    cache: CacheDep,
    cart_srv: CartDep,
    product_srv: ProductDep,
    settings_service: SettingsDep,
    evt_bus: EventBus = Depends(get_event_bus),
    coupon_srv: CouponService = Depends(get_coupon_service)) -> OrderService:
    return OrderService(
        db=db,
        cart_srv=cart_srv,
        product_srv=product_srv,
        coupon_srv=coupon_srv,
        settings_service=settings_service,
        notification_dispatcher=get_notification_service(),
        event_bus=evt_bus,
        cache=cache
    )

def order_service_container_factory(db_instance: Prisma) -> OrderService:
    """Dynamically bundles child dependencies for non-HTTP background routines."""
    # 1. Initialize lowest layer dependencies
    cache_srv = CacheService(redis_client=redis_client)
    event_bus = EventBus(redis=redis_client)
    notification_dispatcher = get_notification_service()

    # 2. Build sub-services
    product_srv = ProductService(db=db, redis=redis_client, cache_srv=cache_srv, search_srv=SearchService())
    cart_srv = CartService(db=db_instance, cache=cache_srv, settings_service=get_shop_settings_service(), coupon_service=CouponService(db=db))
    coupon_srv = CouponService(db=db_instance)
    settings_srv = ShopSettingsService(db=db, redis=redis_client)

    # 3. Return fully hydrated orchestrator service
    return OrderService(
        db=db_instance,
        cart_srv=cart_srv,
        product_srv=product_srv,
        coupon_srv=coupon_srv,
        settings_service=settings_srv,
        notification_dispatcher=notification_dispatcher,
        event_bus=event_bus,
        cache=cache_srv
    )

OrderDep = Annotated[OrderService, Depends(get_order_service)]
