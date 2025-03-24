from app.models.generic import Message
from fastapi import APIRouter, HTTPException, status, Response
from pydantic import EmailStr

from app.core import security
from app.core.config import settings
from app.core.utils import generate_magic_link_email, send_email
from app.models.user import User
from app.prisma_client import prisma
from app.models.generic import Token, MagicLinkPayload
from datetime import datetime, timedelta
from pydantic import BaseModel

class TokenPayload(BaseModel):
    token: str

router = APIRouter()

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
