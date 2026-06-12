from typing import Optional
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from app.core.deps import CurrentUser
from app.models.wishlist import Wishlists, WishlistCreate
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from prisma.enums import Role, Status
from app.models.user import User, UserSelf, UserAdmin, UserUpdateMe, UserUpdate, PaginatedUsers, GuestUserCreate
from app.core.security import get_password_hash
from app.core.permissions import require_admin

router = APIRouter()


@router.get("/get-user")
async def get_user(
    email: str,
) -> User:
    user = await db.user.find_first(
        where={
            "email": email,
        }
    )
    return user


@router.get("/me")
async def read_user_me(
    user: CurrentUser
) -> UserSelf:
    """Get current user with caching."""
    return user


@router.patch("/me")
async def update_user_me(
    user_in: UserUpdateMe,
    user: CurrentUser,
) -> User:
    """
    Update own user.
    """
    if user_in.email:
        existing = await db.user.find_unique(
            where={
                "email": user_in.email,
                "NOT": {
                    "id": user.id
                }
            }
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    try:
        update = await db.user.update(
            where={"id": user.id},
            data=user_in.model_dump(exclude_unset=True)
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/", dependencies=[Depends(require_admin)])
async def index(
    query: str = "",
    role: Optional[Role] = None,
    status: Optional[Status] = None,
    sort: Optional[str] = "desc",
    cursor: int | None = None,
    limit: int = Query(default=20, le=100),
) -> PaginatedUsers:
    """
    Retrieve users with Redis caching.
    """
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"first_name": {"contains": query, "mode": "insensitive"}},
                {"last_name": {"contains": query, "mode": "insensitive"}}
            ]
        }
    if role:
        where_clause = where_clause or {}
        where_clause["role"] = role
    if status:
        where_clause = where_clause or {}
        where_clause["status"] = status

    users = await db.user.find_many(
        where=where_clause,
        order={"created_at": sort},
        skip=1 if cursor else 0,
        take=limit + 1,
        cursor={"id": cursor} if cursor else None,
    )
    items = users[:limit]

    return {
        "items": items,
        "next_cursor": items[-1].id if len(users) > limit else None,
        "limit": limit
    }


@router.post("/create-guest", dependencies=[Depends(require_admin)])
async def create_guest_user(payload: GuestUserCreate) -> User:
    """
    Admin-only: Create a new user with an email in the guest.com domain.
    """
    def normalize(value: str) -> str:
        safe = "".join(ch for ch in value.strip().lower().replace(" ", ".") if ch.isalnum() or ch == "." or ch == "-")
        while ".." in safe:
            safe = safe.replace("..", ".")
        return safe.strip('.')

    username = f"{normalize(payload.first_name)}.{normalize(payload.last_name)}"
    email = f"{username}@guest.com"

    existing = await db.user.find_unique(where={"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        created = await db.user.create(
            data={
                "email": email,
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "hashed_password": get_password_hash("ChangeMe123!"),
                "role": "CUSTOMER",
                "status": "ACTIVE",
            }
        )
        return created
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}", dependencies=[Depends(require_admin)])
async def update(
    *,
    id: int,
    update_data: UserUpdate,
) -> UserAdmin:
    """
    Update a user.
    """
    existing = await db.user.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        update = await db.user.update(
            where={"id": id},
            data=update_data.model_dump(exclude_unset=True)
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete(id: int) -> Message:
    """
    Delete a user.
    """
    existing = await db.user.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        await db.user.delete(
            where={"id": id}
        )
        return Message(message="User deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/wishlist")
@cacheable(
    key_prefix="wishlist",
    key_builder=lambda user: user.id,
    tags=lambda user: [f"wishlist:{user.id}"]
)
async def read_wishlist(request: Request, user: CurrentUser) -> Wishlists:
    if not user:
        return {"wishlists": []}
    items = await db.favorite.find_many(
        where={"user_id": user.id},
        order={"created_at": "desc"},
        include={"product": {"include" : {"images": True}}}
    )
    return {"wishlists": items}


@router.post("/wishlist")
async def create_user_wishlist_item(item: WishlistCreate, user: CurrentUser, cache: CacheDep) -> Message:
    try:
        await db.favorite.create(
            data={
                **item.model_dump(),
                "user_id": user.id
            }
        )
        await cache.invalidate(tags=[f"wishlist:{user.id}"])
        return Message(message="Product added to wishlist")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/wishlist/{product_id}")
async def remove_wishlist_item(product_id: int, user: CurrentUser, cache: CacheDep) -> Message:
    existing = await db.favorite.find_unique(
        where={
            'user_id_product_id': {
                'user_id': user.id,
                'product_id': product_id
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        await db.favorite.delete(
            where={
                'user_id_product_id': {
                    'user_id': user.id,
                    'product_id': product_id
                }
            }
        )
        await cache.invalidate(tags=[f"wishlist:{user.id}"])
        return Message(message="Product deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
