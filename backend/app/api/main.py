from fastapi import APIRouter

from app.api.routes import (
    auth,
    activities,
    address,
    brand,
    bank_details,
    cart,
    category,
    collection,
    config,
    delivery,
    faq,
    conversation,
    order,
    payments,
    product,
    tag,
    users,
    reviews,
    websocket,
    shop_settings,
    base,
    carousel,
    user_interaction,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(address.router, prefix="/address", tags=["address"])
api_router.include_router(bank_details.router, prefix="/bank-details", tags=["bank-details"])
api_router.include_router(brand.router, prefix="/brand", tags=["brand"])
api_router.include_router(base.router, prefix="", tags=["base"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(category.router, prefix="/category", tags=["category"])
api_router.include_router(collection.router, prefix="/collection", tags=["collection"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["conversation"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(faq.router, prefix="/faq", tags=["faq"])
api_router.include_router(order.router, prefix="/order", tags=["order"])
api_router.include_router(product.router, prefix="/product", tags=["product"])
api_router.include_router(payments.router, prefix="/payment", tags=["payment"])
api_router.include_router(tag.router, prefix="/tag", tags=["tag"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
api_router.include_router(shop_settings.router, prefix="/shop-settings", tags=["shop-settings"])
api_router.include_router(delivery.router, prefix="/delivery", tags=["delivery"])
api_router.include_router(carousel.router, prefix="/carousel", tags=["carousel"])
api_router.include_router(user_interaction.router, prefix="/user-interactions", tags=["user-interactions"])
