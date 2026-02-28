from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Request, Header
from pydantic import EmailStr, BaseModel, Field
from app.core import security
from app.core.config import settings
from app.core.utils import generate_magic_link_email, send_email, generate_verification_email
from app.models.user import User, EmailData, SyncUserPayload, GooglePayload
from app.services.events import publish_user_registered
from datetime import datetime, timedelta
from app.models.generic import Token, Message
from app.prisma_client import prisma as db

import httpx
from typing import Optional
from app.core.logging import get_logger
from app.core.decorators import limit

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
async def verify_email(payload: VerifyEmailPayload, cartId: str = Header(default=None)) -> Token:
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

    await merge_cart(user_id=user.id, cart_number=cartId)

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


@router.post("/logout")
async def logout():
    return Message(message="Logout successful")


@router.post("/send-magic-link")
@limit("3/minute")
async def send_magic_link(
    request: Request,
    payload: EmailData,
    cartId: str = Header(default=None)
) -> Message:
    """
    Request a magic link for passwordless authentication.
    A user will only be created if:
      - Email is valid
      - Magic link email is successfully sent
    """

    email: str = payload.email
    url: str = payload.url

    user = await db.user.find_first(
        where={"email": email}
    )

    is_new_user = False

    if not user:
        is_new_user = True
        user_data = {
            "email": email,
            "first_name": "",
            "last_name": "",
            "image": "",
            "status": "PENDING",
            "role": "CUSTOMER",
            "hashed_password": "password"
        }
    else:
        user_data = None

    try:
        email_data = await generate_magic_link_email(
            email_to=email,
            magic_link=url,
            first_name=user.first_name if user else ""
        )

        await send_email(
            email_to=email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send magic link at this time."
        )

    if is_new_user:
        user = await db.user.create(data=user_data)

        try:
            await publish_user_registered(
                user=user,
                source="magic_link_auto_create",
                created_at=user.created_at,
            )
        except Exception:
            pass

    if cartId:
        await merge_cart(user_id=user.id, cart_number=cartId)

    return {
        "message": "If an account exists with this email, you will receive a magic link"
    }


@router.post("/sync-user")
async def sync_user(request: Request, payload: SyncUserPayload, cartId: str = Header(default=None)) -> Message:
    user = await db.user.find_first(
        where={
            "email": payload.email,
        }
    )
    if not user:
        user = await db.user.create(
            data={
                "email": payload.email,
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "image": payload.image,
                "status": "ACTIVE",
                "role": "CUSTOMER",
                "hashed_password": "password"
            }
        )
        try:
            await publish_user_registered(
                user=user,
                source="sync_user",
                created_at=user.created_at,
            )
        except Exception as e:
            logger.error(f"Failed to publish USER_REGISTERED event: {e}")

    await merge_cart(user_id=user.id, cart_number=cartId)
    return {"message": "User synced successfully"}


async def merge_cart(user_id: str, cart_number: str | None = None):
    if not cart_number:
        return
    await db.cart.update(
        where={"cart_number": cart_number},
        data={"user_id": user_id},
    )

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

#     return {"message": "User registered successfully"}
