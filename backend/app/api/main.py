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
    delivery,
    faq,
    chat,
    order,
    gallery,
    payments,
    product,
    users,
    reviews,
    websocket,
    shop_settings,
    base,
    carousel,
    user_interaction,
    catalog,
    notification,
    coupon,
    wallet
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
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(faq.router, prefix="/faq", tags=["faq"])
api_router.include_router(notification.router, prefix="/notification", tags=["notification"])
api_router.include_router(order.router, prefix="/order", tags=["order"])
api_router.include_router(product.router, prefix="/product", tags=["product"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])
api_router.include_router(payments.router, prefix="/payment", tags=["payment"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
api_router.include_router(shop_settings.router, prefix="/shop-settings", tags=["shop-settings"])
api_router.include_router(delivery.router, prefix="/delivery", tags=["delivery"])
api_router.include_router(carousel.router, prefix="/carousel", tags=["carousel"])
api_router.include_router(user_interaction.router, prefix="/user-interactions", tags=["user-interactions"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
api_router.include_router(coupon.router, prefix="/coupon", tags=["coupon"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
