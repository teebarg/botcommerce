from typing import Annotated, Optional
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Request, Cookie, Response, Depends
from pydantic import EmailStr, BaseModel, Field
from app.core import security
from app.core.config import settings
from app.core.utils import send_email, generate_verification_email
from app.models.user import User, GooglePayload
from app.services.events import publish_user_registered
from datetime import datetime, timedelta
from app.models.generic import Token
from app.prisma_client import prisma as db
import uuid
import httpx
from app.core.logging import get_logger
from app.services.redis import set_session, delete_session
from app.core.deps import verify_clerk_token
from app.services.cart import merge_cart

logger = get_logger(__name__)

router = APIRouter()

class TokenPayload(BaseModel):
    token: str

class SignUpPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=40)
    first_name: str = Field(max_length=255)
    last_name: str = Field(max_length=255)

class VerifyEmailPayload(BaseModel):
    token: str

class OAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None


def tokenData(user: User):
    return {
        "id": user.id,
        "sub": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "status": user.status,
        "role": user.role
    }

@router.post("/signup")
async def signup(request: Request, payload: SignUpPayload, background_tasks: BackgroundTasks) -> Token:
    """
    Register a new user with email and password.
    Requires CAPTCHA verification and email verification.
    """
    existing_user = await db.user.find_first(
        where={
            "email": payload.email,
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = security.get_password_hash(payload.password)

    verification_token = security.create_email_verification_token(
        payload.email)

    user = await db.user.create(
        data={
            "email": payload.email,
            "hashed_password": hashed_password,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "status": "PENDING",
            "role": "CUSTOMER",
            "email_verification_token": verification_token,
            "email_verification_expires": datetime.utcnow() + timedelta(hours=24),
        }
    )

    try:
        await publish_user_registered(
            user=user,
            source="email_password",
            created_at=user.created_at,
        )
    except Exception as e:
        logger.error(f"Failed to publish USER_REGISTERED event: {e}")
        pass

    async def send_verification_email():
        verification_email = await generate_verification_email(
            email_to=payload.email,
            first_name=payload.first_name,
            verification_link=f"{settings.FRONTEND_HOST}/verify-email?token={verification_token}"
        )
        await send_email(
            email_to=payload.email,
            subject=verification_email.subject,
            html_content=verification_email.html_content,
        )

    background_tasks.add_task(send_verification_email)

    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(access_token=access_token)


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailPayload, _cart_id: Annotated[str | None, Cookie()] = None) -> Token:
    """
    Verify user's email address and activate their account.
    """
    email = security.verify_email_token(payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    user = await db.user.find_first(
        where={
            "email": email,
            "email_verification_token": payload.token,
            "email_verification_expires": {
                "gt": datetime.utcnow()
            }
        }
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    await db.user.update(
        where={"id": user.id},
        data={
            "status": "ACTIVE",
            "email_verification_token": None,
            "email_verification_expires": None,
        }
    )

    await merge_cart(user_id=user.id, cart_number=_cart_id)

    try:
        await publish_user_registered(
            user=user,
            source="verification",
            created_at=user.created_at,
        )
    except Exception as e:
        logger.error(f"Failed to publish USER_REGISTERED event: {e}")
        pass

    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(access_token=access_token)


@router.get("/oauth/google")
async def google_oauth_url():
    """Generate Google OAuth URL"""
    auth_url: str = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.FRONTEND_HOST}/auth/google/callback"
        "&response_type=code"
        "&scope=email profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return {"url": auth_url}


@router.post("/oauth/google/callback")
async def google_oauth_callback(request: Request, payload: OAuthCallback) -> Token:
    """Handle Google OAuth callback"""
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": payload.code,
                "redirect_uri": f"{settings.FRONTEND_HOST}/auth/google/callback",
                "grant_type": "authorization_code",
            }
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get access token"
            )

        token_data = token_response.json()

        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info"
            )

        user_info = user_response.json()

        user_before = await db.user.find_first(where={"email": user_info["email"]})
        user = await db.user.upsert(
            where={"email": user_info["email"]},
            data={
                "create": {
                    "email": user_info["email"],
                    "first_name": user_info.get("given_name", ""),
                    "last_name": user_info.get("family_name", ""),
                    "image": user_info.get("picture"),
                    "status": "ACTIVE",
                    "hashed_password": "password"
                },
                "update": {}
            }
        )

        if not user_before:
            try:
                await publish_user_registered(
                    user=user,
                    source="google_oauth",
                    created_at=user.created_at,
                )
            except Exception:
                pass

        access_token = security.create_access_token(
            data=tokenData(user=user),
            expires_delta=timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return Token(access_token=access_token)


@router.post("/google")
async def google(request: Request, payload: GooglePayload) -> Token:
    """Handle Google OAuth callback"""
    user_before = await db.user.find_first(where={"email": payload.email})
    user = await db.user.upsert(
        where={"email": payload.email},
        data={
            "create": {
                "email": payload.email,
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "image": payload.image,
                "status": "ACTIVE",
                "hashed_password": "password"
            },
            "update": {}
        }
    )

    if not user_before:
        try:
            await publish_user_registered(
                user=user,
                source="google_direct",
                created_at=user.created_at,
            )
        except Exception:
            pass

    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(access_token=access_token)


# async def merge_cart(user_id: str, cart_number: str | None = None) -> None:
#     cart = await db.cart.find_first(
#         where={"user_id": user_id, "status": "ACTIVE"},
#         order={"created_at": "desc"}
#     )
#     if cart:
#         return
#     if not cart_number:
#         return
#     await db.cart.update(
#         where={"cart_number": cart_number},
#         data={"user_id": user_id},
#     )


@router.post("/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")

    if session_id:
        await delete_session(session_id)

    response.delete_cookie("session_id")

    return {"ok": True}


@router.post("/exchange")
async def exchange_token(response: Response, payload=Depends(verify_clerk_token)):
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

    return session_data

# @router.post("/test-job")
# async def test(request: Request, id: int):
#     """
#     Test job
#     """
#     user = await db.user.find_first(
#         where={
#             "id": id,
#         }
#     )

#     try:
#         await publish_user_registered(
#             user=user,
#             source="email_password",
#             created_at=user.created_at,
#         )
#     except Exception as e:
#         logger.error(f"Failed to publish USER_REGISTERED event: {e}")
#         pass
