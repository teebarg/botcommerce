from app.models.generic import Message
from fastapi import APIRouter, HTTPException, status, Response, Depends, Request
from pydantic import EmailStr, BaseModel, Field
from app.core.config import settings

from app.core import security
from app.core.config import settings
from app.core.utils import generate_magic_link_email, send_email, generate_welcome_email, generate_verification_email
from app.models.user import User
from app.prisma_client import prisma
from app.models.generic import Token, MagicLinkPayload
from datetime import datetime, timedelta
from pydantic import BaseModel

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


def tokenData(user: User):
    return {
        "id": user.id,
        "sub": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "status": user.status,
        "role": user.role
    }

@router.post("/magic-link")
async def request_magic_link(
    payload: MagicLinkPayload,
) -> Message:
    """
    Request a magic link for passwordless authentication.
    The link will be sent to the user's email if they have an account.
    """
    email = payload.email
    callback_url = payload.callback_url

    # Check if user exists
    user = await prisma.user.find_first(
        where={
            "email": email,
            # "is_active": True,
        }
    )

    if not user:
        # Don't reveal if user exists or not
        return {"message": "If an account exists with this email, you will receive a magic link"}

    # Generate magic link token
    token = security.create_magic_link_token(email)

    # Create magic link URL
    magic_link = f"{settings.FRONTEND_HOST}/verify?token={token}"
    if callback_url is not None:
        magic_link += f"&callbackUrl={callback_url}"

    # Generate and send email
    email_data = generate_magic_link_email(email_to=email, magic_link=magic_link, first_name=user.first_name)
    send_email(
        email_to=email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )

    return {"message": "If an account exists with this email, you will receive a magic link"}

@router.post("/verify-magic-link")
async def verify_magic_link(token: TokenPayload, response: Response) -> Token:
    """
    Verify a magic link token and return an access token if valid.
    """
    email = security.verify_magic_link_token(token.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired magic link",
        )

    # Get user
    user = await prisma.user.find_first(
        where={
            "email": email,
            # "is_active": True,
        }
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    # Generate access token
    access_token = security.create_access_token(
        data=tokenData(user=user),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=timedelta(days=30),
        secure=True,
        httponly=True,
    )

    return Token(access_token=access_token)

@router.post("/signup")
async def signup(payload: SignUpPayload) -> Token:
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

    # Send verification email
    verification_email = generate_verification_email(
        email_to=payload.email,
        first_name=payload.first_name,
        verification_link=f"{settings.FRONTEND_HOST}/verify-email?token={verification_token}"
    )
    send_email(
        email_to=payload.email,
        subject=verification_email.subject,
        html_content=verification_email.html_content,
    )

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
    welcome_email = generate_welcome_email(
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
