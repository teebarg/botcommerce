from typing import Annotated
from fastapi import APIRouter, Request, Cookie, Response, Depends
from app.core.config import settings
from app.prisma_client import prisma as db
import uuid
from app.core.logging import get_logger
from app.services.redis import set_session, delete_session
from app.core.deps import verify_clerk_token
from app.services.cart import merge_cart

logger = get_logger(__name__)

router = APIRouter()


@router.post("/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")

    if session_id:
        await delete_session(session_id)

    response.delete_cookie("session_id")

    return {"ok": True}


@router.post("/exchange")
async def exchange_token(response: Response, payload=Depends(verify_clerk_token), _cart_id: Annotated[str | None, Cookie()] = None):
    session_id = str(uuid.uuid4())

    clerk_id = payload["sub"]

    user = await db.user.find_unique(
        where={"clerk_id": clerk_id}
    )

    if not user:
        user = await db.user.upsert(
            where={"email": payload["email"]},
            data={
                "create": {"clerk_id": clerk_id, "email": payload["email"], "first_name": payload.get("firstName"), "last_name": payload.get("lastName"), "image": payload.get("image_url"), "hashed_password": "dkkdkdkkdkdkd22h3s"},
                "update": {"clerk_id": clerk_id},
            },
        )

    session_data = {
        "id": user.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "sub": payload["sub"],
        "email": payload.get("email"),
        "image": payload.get("image_url"),
        "role": payload.get("role"),
        "roles": payload.get("roles", []),
    }

    await set_session(session_id, session_data)

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
    await merge_cart(user_id=user.id, cart_number=_cart_id)

    return session_data
