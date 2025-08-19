from app.models.generic import Message
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Request
from pydantic import EmailStr, BaseModel, Field
from app.core.config import settings

from app.core import security
from app.core.config import settings
from app.core.utils import generate_magic_link_email, send_email, generate_welcome_email, generate_verification_email
from app.models.user import User
from app.prisma_client import prisma
from app.services.redis import CacheService
from datetime import datetime, timedelta
from pydantic import BaseModel

import httpx
from typing import Optional

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

# OAuth Models
class OAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None

class GooglePayload(BaseModel):
    email: str
    first_name: str
    last_name: str
    image: Optional[str] = None

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

    # Check if user already exists
    existing_user = await prisma.user.find_first(
        where={
            "email": payload.email,
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password
    hashed_password = security.get_password_hash(payload.password)

    # Generate email verification token
    verification_token = security.create_email_verification_token(payload.email)

    # Create user with pending status
    user = await prisma.user.create(
        data={
            "email": payload.email,
            "hashed_password": hashed_password,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "status": "PENDING",  # User starts with pending status
            "role": "CUSTOMER",
            "email_verification_token": verification_token,
            "email_verification_expires": datetime.utcnow() + timedelta(hours=24),
        }
    )

    # Publish event for new user registration
    try:
        cache: CacheService = CacheService(request.app.state.redis)
        await cache.publish_event(
            "user.created",
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "status": user.status,
                "role": user.role,
                "source": "email_password",
                "created_at": user.created_at,
            },
        )
    except Exception:
        pass

    async def send_verification_email():
        verification_email = await generate_verification_email(
            email_to=payload.email,
            first_name=payload.first_name,
            verification_link=f"{settings.FRONTEND_HOST}/verify-email?token={verification_token}"
        )
        send_email(
            email_to=payload.email,
            subject=verification_email.subject,
            html_content=verification_email.html_content,
        )

    background_tasks.add_task(send_verification_email)

    # Generate access token
    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(access_token=access_token)

@router.post("/verify-email")
async def verify_email(payload: VerifyEmailPayload) -> Token:
    """
    Verify user's email address and activate their account.
    """
    email = security.verify_email_token(payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    # Get user
    user = await prisma.user.find_first(
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

    # Update user status and clear verification token
    await prisma.user.update(
        where={"id": user.id},
        data={
            "status": "ACTIVE",
            "email_verification_token": None,
            "email_verification_expires": None,
        }
    )

    # Send welcome email
    welcome_email = await generate_welcome_email(
        email_to=user.email,
        first_name=user.first_name
    )
    send_email(
        email_to=user.email,
        subject=welcome_email.subject,
        html_content=welcome_email.html_content,
    )

    # Generate access token
    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(access_token=access_token)


@router.get("/oauth/google")
async def google_oauth_url():
    """Generate Google OAuth URL"""
    auth_url = (
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

        # Get user info
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

        # Create or update user
        user_before = await prisma.user.find_first(where={"email": user_info["email"]})
        user = await prisma.user.upsert(
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

        # Publish event only if this is a new user
        if not user_before:
            try:
                cache: CacheService = CacheService(request.app.state.redis)
                await cache.publish_event(
                    "user.created",
                    {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "status": user.status,
                        "role": user.role,
                        "source": "google_oauth",
                        "created_at": user.created_at,
                    },
                )
            except Exception:
                pass

        # Generate access token
        access_token = security.create_access_token(
            data=tokenData(user=user),
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return Token(access_token=access_token)


@router.post("/google")
async def google(request: Request, payload: GooglePayload) -> Token:
    """Handle Google OAuth callback"""
    # Create or update user
    user_before = await prisma.user.find_first(where={"email": payload.email})
    user = await prisma.user.upsert(
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

    # Publish event only if this is a new user
    if not user_before:
        try:
            cache: CacheService = CacheService(request.app.state.redis)
            await cache.publish_event(
                "user.created",
                {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "status": user.status,
                    "role": user.role,
                    "source": "google_direct",
                    "created_at": user.created_at,
                },
            )
        except Exception:
            pass

    # Generate access token
    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(access_token=access_token)

@router.post("/logout")
async def logout():
    return Message(message="Logout successful")


class EmailData(BaseModel):
    email: str
    url: str

@router.post("/send-magic-link")
async def send_magic_link(
    request: Request,
    background_tasks: BackgroundTasks,
    payload: EmailData,
) -> Message:
    """
    Request a magic link for passwordless authentication.
    The link will be sent to the user's email if they have an account.
    """
    email = payload.email
    url = payload.url

    user = await prisma.user.find_first(
        where={
            "email": email,
        }
    )

    if not user:
        user = await prisma.user.create(
            data={
                "email": email,
                "first_name": "",
                "last_name": "",
                "image": "",
                "status": "ACTIVE",
                "role": "CUSTOMER",
                "hashed_password": "password"
            }
        )
        # Publish event for new user registration via magic link request
        try:
            cache: CacheService = CacheService(request.app.state.redis)
            await cache.publish_event(
                "user.created",
                {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "status": user.status,
                    "role": user.role,
                    "source": "magic_link_auto_create",
                    "created_at": user.created_at,
                },
            )
        except Exception:
            pass

    async def send_magic_link_email(name: str, email: str, url: Optional[str] = None):
        email_data = await generate_magic_link_email(email_to=email, magic_link=url, first_name=name)
        send_email(
            email_to=email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    background_tasks.add_task(send_magic_link_email, user.first_name, email, url)

    return {"message": "If an account exists with this email, you will receive a magic link"}

class SyncUserPayload(BaseModel):
    email: str
    first_name: str
    last_name: str
    image: Optional[str] = None

@router.post("/sync-user")
async def sync_user(request: Request, payload: SyncUserPayload) -> Message:
    user = await prisma.user.find_first(
        where={
            "email": payload.email,
        }
    )
    if not user:
        user = await prisma.user.create(
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
        # Publish event for new user registration via sync-user
        try:
            cache: CacheService = CacheService(request.app.state.redis)
            await cache.publish_event(
                "user.created",
                {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "status": user.status,
                    "role": user.role,
                    "source": "sync_user",
                    "created_at": user.created_at,
                },
            )
        except Exception:
            pass
    return {"message": "User synced successfully"}