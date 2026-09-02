from typing import Annotated, Any

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Cookie,
    HTTPException,
    Response,
)
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.dependencies.cart import CartDep
from app.core.deps import CurrentUser, UserDep
from app.core.logging import get_logger
from app.models.cart import (
    CartItem,
    CartItemCreate,
    CartLite,
    CartUpdate,
)
from app.models.generic import Message
from app.prisma_client import DbDep

logger = get_logger(__name__)

router = APIRouter()

MAX_AGE_SECONDS = 365 * 24 * 60 * 60 * 10  # 1 year

def _set_cart_cookie(response: Response, token: str | None) -> None:
    response.set_cookie(
        key="_cart_id", value=token, max_age=MAX_AGE_SECONDS, path="/",
        httponly=True, secure=True, samesite="none", domain=settings.COOKIE_DOMAIN,
    )

@router.get("/")
async def get_cart_index(
    response: Response,
    user: UserDep,
    srv: CartDep,
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None, include_relations=True)
    if not cart:
        cart = await srv.create_empty_cart(user_id=user.id if user else None, include_relations=True)

    _set_cart_cookie(response, cart.cart_number)
    return await srv._with_computed_totals(cart=cart)

@router.post("/items", response_model=CartItem)
async def add_item_to_cart(
    response: Response,
    payload: CartItemCreate,
    srv: CartDep,
    user: UserDep,
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        cart = await srv.create_empty_cart(user_id=user.id if user else None)

    item = await srv.add_item(cart=cart, variant_id=payload.variant_id, quantity=payload.quantity)
    await srv.touch(cart_id=cart.id)
    _set_cart_cookie(response, cart.cart_number)
    return item

@router.delete("/items/{item_id}")
async def delete_cart_item(
    item_id: int,
    db: DbDep,
    user: UserDep,
    srv: CartDep,
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart session not found")

    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="Cart item relation mismatch")

    await db.cartitem.delete(where={"id": item_id})
    await srv.touch(cart_id=cart.id)
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}", response_model=CartItem)
async def update_cart_item(
    item_id: int,
    quantity: int,
    db: DbDep,
    user: UserDep,
    srv: CartDep,
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart sequence missing")

    cart_item = await db.cartitem.find_unique(where={"id": item_id}, include={"variant": True})
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="Cart item tracking mismatch")

    if quantity > cart_item.variant.inventory:
        raise HTTPException(status_code=400, detail=f"Not enough inventory. Only {cart_item.variant.inventory} items available.")

    updated_item = await db.cartitem.update(where={"id": item_id}, data={"quantity": quantity})
    await srv.touch(cart_id=cart.id)
    return updated_item


@router.put("/")
async def update_cart(
    cart_update: CartUpdate,
    db: DbDep,
    user: UserDep,
    srv: CartDep,
    background_tasks: BackgroundTasks,
    _cart_id: Annotated[str | None, Cookie()] = None
) -> CartLite:
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        cart = await srv.create_empty_cart(user_id=user.id if user else None)

    async with db.tx() as tx:
        update_data: Any = {}
        if cart_update.shipping_address:
            if cart_update.shipping_address.id:
                address = await tx.address.upsert(
                    where={"id": cart_update.shipping_address.id},
                    data={
                        "create": {
                            **cart_update.shipping_address.model_dump(exclude={"id"}),
                            "user_id": user.id if user else None
                        },
                        "update": {
                            **cart_update.shipping_address.model_dump(exclude={"id", "user_id"}),
                        }
                    }
                )
            else:
                address = await tx.address.create(
                    data={
                        **cart_update.shipping_address.model_dump(exclude={"id"}),
                        "user_id": user.id if user else None
                    }
                )

            update_data["shipping_address"] = {"connect": {"id": address.id}}
            update_data["billing_address"] = {"connect": {"id": address.id}}

            await srv.cache_srv.invalidate(tags=[f"addresses:{user.id if user else 'guest'}"])

        if cart_update.status is not None:
            update_data["status"] = cart_update.status
        if cart_update.email is not None:
            update_data["email"] = cart_update.email
        if cart_update.phone is not None:
            update_data["phone"] = cart_update.phone
            if user:
                background_tasks.add_task(srv.update_contact, user_id=user.id, phone=cart_update.phone)
        if cart_update.payment_method is not None:
            update_data["payment_method"] = cart_update.payment_method
        if cart_update.shipping_method is not None:
            shM = await tx.deliveryoption.find_unique(
                where={"id": cart_update.shipping_method}
            )
            if not shM:
                raise HTTPException(status_code=404, detail="Shipping method not found")
            update_data["shipping_fee"] = shM.amount
            update_data["shipping_method"] = shM.method

        # if user:
        #     update_data["user"] = {"connect": {"id": user.id}}

        updated_cart = await tx.cart.update(
            where={"cart_number": cart.cart_number},
            data=update_data
        )

    await srv.cache_srv.invalidate(tags=["abandoned-carts"])

    return updated_cart


@router.post("/apply-wallet")
async def apply_wallet(
    db: DbDep,
    user: CurrentUser,
    srv: CartDep,
    _cart_id: Annotated[str | None, Cookie()] = None
) -> Message:
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id)
    if not cart or (await db.cartitem.count(where={"cart_id": cart.id})) == 0:
        return JSONResponse(status_code=400, content={"detail": "Your cart is currently empty"})

    await srv.apply_wallet_balance(cart=cart, user=user)
    return Message(message="Wallet balance applied successfully")


@router.post("/remove-wallet")
async def remove_wallet(
    user: CurrentUser,
    srv: CartDep,
    _cart_id: Annotated[str | None, Cookie()] = None
) -> Message:
    cart = await srv.get_active_cart(cart_number=_cart_id, user_id=user.id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    await srv.remove_wallet_balance(cart=cart, user=user)
    return Message(message="Wallet usage removed from cart session")
