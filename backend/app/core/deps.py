import json
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.core import security
from app.core.config import settings
from app.core.logging import logger
from app.models.generic import TokenPayload
from app.services.cache import CacheService, get_cache_service
from app.services.notification import EmailChannel, NotificationService, SlackChannel
from app.prisma_client import prisma
from meilisearch import Client as MeilisearchClient
from prisma.models import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

# Create once at startup
meilisearch_client = MeilisearchClient(settings.MEILI_HOST, settings.MEILI_MASTER_KEY, timeout=1.5)


# SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str | None, Depends(APIKeyHeader(name="X-Auth"))]

CacheService = Annotated[CacheService, Depends(get_cache_service)]

async def get_user_token(access_token: TokenDep) -> TokenPayload | None:
    try:
        payload = jwt.decode(
            access_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        return None

    return token_data

TokenUser = Annotated[TokenPayload, Depends(get_user_token)]


async def get_current_user(token_data: TokenUser, cache: CacheService) -> User:
    if not token_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    # Check if user is in cache
    user = cache.get(f"user:{token_data.sub}")
    if user is None:
        user = await prisma.user.find_unique(
            where={"email": token_data.sub}
        )
        if user:
            cache.set(f"user:{token_data.sub}", user.model_dump_json(), expire=3600)  # Store user in cache
    else:
        user = User(**json.loads(user))

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status == "inactive":
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthenticated user"
        )
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_superuser(current_user: CurrentUser) -> User:
    if not current_user.role == "ADMIN":
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


AdminUser = Annotated[User, Depends(get_current_superuser)]

def get_notification_service() -> NotificationService:
    notification_service = NotificationService()

    # Configure email channel
    email_channel = EmailChannel(
        smtp_host=settings.SMTP_HOST,
        smtp_port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD
    )
    notification_service.register_channel("email", email_channel)

    # Configure slack channel
    slack_channel = SlackChannel(webhook_url=settings.SLACK_WEBHOOK_URL)
    notification_service.register_channel("slack", slack_channel)

    return notification_service

Notification = Annotated[NotificationService, Depends(get_notification_service)]
