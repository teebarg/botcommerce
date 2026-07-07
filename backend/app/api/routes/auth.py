import uuid
from typing import Annotated
from fastapi.exceptions import HTTPException
from fastapi import APIRouter, Request, Cookie, Response, Depends
from app.core.permissions import require_admin
from app.core.config import settings
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.core.deps import verify_clerk_token
from app.core.dependencies.cart import CartDep
from app.core.dependencies.cache import CacheDep

logger = get_logger(__name__)

router = APIRouter()

def _set_auth_cookie(response: Response, session_id: str | None) -> None:
    response.set_cookie(
        key="session_id",
        path="/",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="none",
        domain=settings.COOKIE_DOMAIN,
        max_age=60 * 60 * 24 * 30,
    )


@router.post("/logout")
async def logout(request: Request, response: Response, cache_srv: CacheDep):
    session_id = request.cookies.get("session_id")

    if session_id:
        await cache_srv.delete_session(session_id)

    response.delete_cookie("session_id")

    return {"ok": True}


@router.post("/exchange")
async def exchange_token(response: Response, cache_srv: CacheDep, cart_srv: CartDep, payload=Depends(verify_clerk_token), _cart_id: Annotated[str | None, Cookie()] = None):
    session_id = str(uuid.uuid4())
    clerk_id = payload["sub"]

    user = await db.user.find_unique(where={"clerk_id": clerk_id})
    if not user:
        user = await db.user.upsert(
            where={"email": payload["email"]},
            data={
                "create": {"clerk_id": clerk_id, "email": payload["email"], "first_name": payload.get("firstName"), "last_name": payload.get("lastName"), "image": payload.get("image_url"), "hashed_password": "hashed_password"},
                "update": {"clerk_id": clerk_id},
            },
        )
        await cache_srv.invalidate(tags=["stats-trends"])

    session_data = {
        "id": user.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "sub": payload["sub"],
        "phone": user.phone,
        "email": payload.get("email"),
        "image": payload.get("image_url"),
        "role": user.role,
        "roles": payload.get("roles", []),
        "isImpersonating": False,
        "impersonatedBy": None,
    }

    await cache_srv.set_session(session_id, session_data)
    _set_auth_cookie(response, session_id)
    await cart_srv.merge_guest_into_user_cart(user_id=user.id, cart_number=_cart_id)

    return session_data


@router.post("/impersonate/{user_id}")
async def impersonate(
    user_id: int,
    response: Response,
    cache_srv: CacheDep,
    current_user=Depends(require_admin),
):
    target = await db.user.find_unique(
        where={
            "id": user_id
        }
    )
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    session_id = str(uuid.uuid4())
    session_data = {
        "id": target.id,
        "firstName": target.first_name,
        "lastName": target.last_name,
        "phone": target.phone,
        "email": target.email,
        "image": target.image,
        "role": target.role,
        "roles": ["user"],
        "isImpersonating": True,
        "impersonatedBy": current_user["id"],
    }

    await cache_srv.set_session(session_id, session_data)
    _set_auth_cookie(response, session_id)
    response.delete_cookie(
        key="_cart_id", path="/", httponly=True, samesite="none", secure=True, domain=settings.COOKIE_DOMAIN,
    )
    return session_data


@router.post("/stop-impersonation")
async def stop_impersonation(request: Request, response: Response, cache_srv: CacheDep):
    session_id = request.cookies.get("session_id")
    session = await cache_srv.get_session(session_id)
    admin_id = session.get("impersonatedBy")
    if not admin_id:
        raise HTTPException(400, "Not impersonating")

    admin = await db.user.find_unique(
        where={
            "id": admin_id
        }
    )

    session_id = str(uuid.uuid4())
    session_data = {
        "id": admin.id,
        "firstName": admin.first_name,
        "lastName": admin.last_name,
        "phone": admin.phone,
        "email": admin.email,
        "image": admin.image,
        "role": admin.role,
        "roles": ["admin", "user"],
        "isImpersonating": False,
        "impersonatedBy": None,
    }
    await cache_srv.set_session(session_id, session_data)
    _set_auth_cookie(response, session_id)
    response.delete_cookie(
        key="_cart_id", path="/", httponly=True, samesite="none", secure=True, domain=settings.COOKIE_DOMAIN,
    )
    return session_data
