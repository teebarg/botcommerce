from datetime import timedelta

from app.core.utils import generate_id
from app.models.message import Message
from app.models.cart import CartCreate, CartDetails, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException, Response
from app.prisma_client import prisma as db

# Create a router for carts
router = APIRouter()


# @router.get("/")
# async def index(response: Response, cartId: str = Header(default=None)) -> Any:
#     """
#     Retrieve cart.
#     """
#     if not cartId:
#         id = generate_id()
#         cart = cart_handler.create_cart(cart_id=id, customer_id="", email="")
#         response.set_cookie(
#             key="_cart_id",
#             value=id,
#             max_age=timedelta(days=7),
#             secure=True,
#             httponly=True,
#         )
#         return cart_handler.get_cart(cart_id=cart.get("cart_id"))
#     return cart_handler.get_cart(cart_id=cartId)


# @router.post("/add")
# async def add_to_cart(
#     db: SessionDep,
#     cart_in: CartItemIn,
#     cartId: str = Header(default=None),
# ):

#     doc = db.get(Product, cart_in.product_id)
#     if not doc:
#         raise HTTPException(
#             status_code=400,
#             detail="Could not find product",
#         )
#     id = str(doc.id)
#     cart_item = CartItem(**doc.dict(), item_id=id, product_id=id, quantity=cart_in.quantity)
#     try:
#         return cart_handler.add_to_cart(cart_id=cartId, item=cart_item)
#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=f"{e}",
#         ) from e


# @router.post("/create")
# async def create_cart():
#     id = generate_id()
#     try:
#         return cart_handler.create_cart(cart_id=id, customer_id="", email="")
#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=f"{e}",
#         ) from e


# @router.patch("/update")
# async def update_cart(cart_in: CartItemIn, cache: CacheService, cartId: str = Header(default=None)):
#     try:
#         cart = cart_handler.update_cart_quantity(
#             cart_id=cartId, product_id=cart_in.product_id, quantity=cart_in.quantity
#         )
#         return cart
#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=f"{e}",
#         ) from e


# @router.patch("/update-cart-details")
# async def update_cart_details(
#     cart_in: CartDetails, cache: CacheService, cartId: str = Header(default=None)
# ):
#     try:
#         update_data = cart_in.dict(exclude_unset=True)
#         return cart_handler.update_cart_details(cart_id=cartId, cart_data=update_data)
#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=f"{e}",
#         ) from e



# Endpoints
@router.post("/", response_model=CartResponse)
async def create_cart(cart: CartCreate):
    """Create a new cart for a user"""
    id = generate_id()
    # Check if user exists
    user = await db.user.find_unique(where={"id": cart.cart_number})
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")

    # Check if user already has an active cart
    existing_cart = await db.cart.find_first(
        where={
            "cart_number": cart.cart_number,
            "status": "ACTIVE"
        }
    )
    if existing_cart:
        raise HTTPException(status_code=400, detail="User already has an active cart")

    new_cart = await db.cart.create(
        data={
            "user_id": user or None,
            "cart_number": id
        },
        include={"items": True}
    )
    return new_cart

@router.get("/", response_model=CartResponse)
async def get_cart(response: Response, cartId: str = Header(default=None)):
    """Get a specific cart by ID"""
    cart = await db.cart.find_unique(
        where={"cart_number": cartId},
        include={"items": True}
    )
    if not cart:
        id = generate_id()
        new_cart = await db.cart.create(
            data={
                "cart_number": id
            },
            include={"items": True}
        )
        response.set_cookie(
            key="_cart_id",
            value=id,
            max_age=timedelta(days=7),
            secure=True,
            httponly=True,
        )
        return new_cart
        # raise HTTPException(status_code=404, detail="Cart not found")
    return cart

# @router.get("/users/{user_id}/cart", response_model=CartResponse)
# async def get_user_active_cart(user_id: int, db: PrismaDb):
#     """Get user's active cart"""
#     cart = await db.cart.find_first(
#         where={
#             "user_id": user_id,
#             "status": "ACTIVE"
#         },
#         include={"items": True}
#     )
#     if not cart:
#         raise HTTPException(status_code=404, detail="No active cart found for user")
#     return cart

@router.put("/", response_model=CartResponse)
async def update_cart(cart_update: CartDetails, cartId: str = Header(default=None)):
    """Update cart status"""
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    updated_cart = await db.cart.update(
        where={"id": cartId},
        data={"status": cart_update.status.value if cart_update.status else cart.status},
        include={"items": True}
    )
    return updated_cart


@router.delete("/{id}")
async def delete(id: str, cartId: str = Header(default=None)) -> Message:
    """
    Delete item from cart.
    """
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    await db.cart.delete(where={"cart_number": cartId})
    return {"message": "Cart deleted successfully"}


# @router.delete("/carts/{cart_id}")
# async def delete_cart(cart_id: int, db: PrismaDb):
#     """Delete a cart"""
#     cart = await db.cart.find_unique(where={"id": cart_id})
#     if not cart:
#         raise HTTPException(status_code=404, detail="Cart not found")

#     await db.cart.delete(where={"id": cart_id})
#     return {"message": "Cart deleted successfully"}

@router.post("/items", response_model=CartItemResponse)
async def add_item_to_cart(response: Response, item: CartItemCreate, cartId: str = Header(default=None)):
    """Add an item to cart"""
    # Verify cart exists
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        id = generate_id()
        cart = await db.cart.create(
            data={
                "cart_number": id
            },
            include={"items": True}
        )
        response.set_cookie(
            key="_cart_id",
            value=id,
            max_age=timedelta(days=7),
            secure=True,
            httponly=True,
        )
        # raise HTTPException(status_code=404, detail="Cart not found")

    # Verify product variant exists and is in stock
    variant = await db.productvariant.find_unique(where={"id": item.variant_id}, include={"product": True})
    if not variant or variant.status != "IN_STOCK":
        raise HTTPException(status_code=400, detail="Product variant not available")

    # Check if item already exists in cart
    existing_item = await db.cartitem.find_first(
        where={
            "cart_id": cart.id,
            "variant_id": item.variant_id
        }
    )

    if existing_item:
        # Update quantity if item exists
        updated_item = await db.cartitem.update(
            where={"id": existing_item.id},
            data={"quantity": existing_item.quantity + item.quantity}
        )
        return updated_item

    # Create new cart item
    new_item = await db.cartitem.create(
        data={
            "cart_id": cart.id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": variant.price,
            "image": variant.product.image
        }
    )
    return new_item

@router.delete("/items/{item_id}")
async def remove_item_from_cart(item_id: int, cartId: str = Header(default=None)):
    """Remove an item from cart"""
    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_id != cartId:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.cartitem.delete(where={"id": item_id})
    return {"message": "Item removed from cart successfully"}

@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item_quantity(item_id: int, quantity: int, cartId: str = Header(default=None)):
    """Update quantity of an item in cart"""
    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_id != cartId:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    updated_item = await db.cartitem.update(
        where={"id": item_id},
        data={"quantity": quantity}
    )
    return updated_item