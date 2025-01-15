from fastapi import APIRouter

from app.api.routes import (
    activities,
    address,
    brand,
    cart,
    category,
    collection,
    config,
    order,
    product,
    tag,
    users,
    websocket,
)

api_router = APIRouter()
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(address.router, prefix="/address", tags=["address"])
api_router.include_router(brand.router, prefix="/brand", tags=["brand"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(category.router, prefix="/category", tags=["category"])
api_router.include_router(collection.router, prefix="/collection", tags=["collection"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(order.router, prefix="/order", tags=["order"])
api_router.include_router(product.router, prefix="/product", tags=["product"])
api_router.include_router(tag.router, prefix="/tag", tags=["tag"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
