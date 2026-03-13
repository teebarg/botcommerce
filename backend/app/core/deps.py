from typing import Annotated, Literal, Optional

import jwt
from fastapi import Depends, HTTPException, status, Cookie, Request
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel, ValidationError

from app.core import security
from app.core.config import settings
from app.models.generic import TokenPayload
from app.services.notification import EmailChannel, NotificationService, SlackChannel, WhatsAppChannel
from app.prisma_client import prisma
from meilisearch import Client as MeilisearchClient
from app.models.user import UserInternal as User, AuthUser
from supabase import create_client, Client
from app.services.redis import get_redis_dependency
import redis.asyncio as redis
from app.services.shop_settings import ShopSettingsService
from app.core.logging import get_logger
import time
import httpx
from jose import jwt as new_jwt

logger = get_logger(__name__)

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

meilisearch_client = MeilisearchClient(settings.MEILI_HOST, settings.MEILI_MASTER_KEY, timeout=1.5)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

TokenDep = Annotated[str | None, Cookie(alias="authjs.session-token" if settings.ENVIRONMENT == "local" else "__Secure-authjs.session-token")]

RedisClient = Annotated[redis.Redis, Depends(get_redis_dependency)]

internal_bearer = HTTPBearer(auto_error=False)

class ServicePrincipal:
    def __init__(self, name: str, role: str) -> None:
        self.name = name
        self.role = role
        self.type = "service"

class Principal(BaseModel):
    id: str
    role: str
    type: Literal["user", "service"]
    user_id: Optional[int] = None


CLERK_JWKS_URL = settings.CLERK_JWKS_URL

JWKS_CACHE = None
JWKS_CACHE_EXP = 0


async def get_jwks():
    global JWKS_CACHE, JWKS_CACHE_EXP

    # refresh every hour
    if JWKS_CACHE and time.time() < JWKS_CACHE_EXP:
        return JWKS_CACHE

    async with httpx.AsyncClient() as client:
        resp = await client.get(CLERK_JWKS_URL)
        JWKS_CACHE = resp.json()
        JWKS_CACHE_EXP = time.time() + 3600

    return JWKS_CACHE


async def verify_clerk_token(request: Request):
    auth = request.headers.get("Authorization")
    # print("🚀 ~ file: deps.py:76 ~ auth:", auth)
    if not auth:
        raise HTTPException(401, "Missing Authorization header")

    token = auth.split(" ")[1]

    jwks = await get_jwks()

    try:
        payload = new_jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER_URL,
            options={"verify_aud": False},
        )
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

    return payload


async def verify_clerk_token2(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        return None

    token = auth.split(" ")[1]
    jwks = await get_jwks()

    try:
        payload = new_jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER_URL,
            options={"verify_aud": False},
        )
    except Exception:
        return None

    return payload


async def get_internal_service(
    credentials: HTTPAuthorizationCredentials | None = Depends(internal_bearer),
) -> ServicePrincipal | None:
    if not credentials:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )

        return ServicePrincipal(
            name=payload.get("sub"),
            role=payload.get("role", "ADMIN"),
        )

    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service token",
        )

async def get_user_token(access_token: TokenDep = None) -> TokenPayload | None:
    try:
        payload = jwt.decode(
            access_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(sub=payload.get("email"))
    except (InvalidTokenError, ValidationError) as e:
        return None

    return token_data

# SessionDep = Annotated[Session, Depends(get_db)]
# TokenDep = Annotated[str | None, Depends(APIKeyHeader(name="X-Auth"))]
TokenUser = Annotated[TokenPayload, Depends(get_user_token)]

# async def get_user(token_data: TokenUser = None ) -> User | None:
async def get_user(payload=Depends(verify_clerk_token2)) -> User | None:
    if not payload:
        return None

    clerk_id = payload["sub"]
    user = await prisma.user.find_unique(
        where={"clerk_id": clerk_id}
    )

    if not user:
        user = await prisma.user.upsert(
            where={"email": payload["email"]},
            data={
                "create": {"clerk_id": clerk_id, "email": payload["email"], "first_name": payload.get("firstName"), "last_name": payload.get("lastName"), "hashed_password": "dkkdkdkkdkdkd22h3s"},
                "update": {"clerk_id": clerk_id},
            },
        )
    return user


UserDep = Annotated[User | None, Depends(get_user)]

async def get_current_user(payload=Depends(verify_clerk_token)) -> User:
    print(payload)
    clerk_id = payload["sub"]

    user = await prisma.user.find_unique(
        where={"clerk_id": clerk_id}
    )

    if not user:
        user = await prisma.user.upsert(
            where={"email": payload["email"]},
            data={
                "create": {"clerk_id": clerk_id, "email": payload["email"], "first_name": payload.get("firstName"), "last_name": payload.get("lastName"), "hashed_password": "dkkdkdkkdkdkd22h3s"},
                "update": {"clerk_id": clerk_id},
            },
        )

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


CurrentUser = Annotated[AuthUser, Depends(get_current_user)]


def get_current_superuser(current_user: CurrentUser) -> AuthUser:
    if not current_user.role == "admin":
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


AdminUser = Annotated[User, Depends(get_current_superuser)]

async def get_principal(
    service: ServicePrincipal | None = Depends(get_internal_service),
    user: User | None = Depends(get_user),
) -> Principal:
    if service:
        return Principal(
            id=service.name,
            role=service.role,
            type="service",
        )
    if not user:
        raise HTTPException(status_code=401, detail="Unauthenticated")

    return Principal(
        id=str(user.id),
        role=user.role,
        type="user",
        user_id=user.id,
    )

PrincipalDep = Annotated[Principal, Depends(get_principal)]

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
    slack_channel = SlackChannel(webhook_url=settings.SLACK_ALERTS)
    notification_service.register_channel("slack", slack_channel)

    # Configure WhatsApp channel
    if getattr(settings, "WHATSAPP_TOKEN", None) and getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", None):
        whatsapp_channel = WhatsAppChannel(
            token=settings.WHATSAPP_TOKEN,
            phone_number_id=settings.WHATSAPP_PHONE_NUMBER_ID,
        )
        notification_service.register_channel("whatsapp", whatsapp_channel)

    return notification_service

Notification = Annotated[NotificationService, Depends(get_notification_service)]

async def get_shop_settings_service() -> ShopSettingsService:
    return ShopSettingsService()

ShopSettingsServiceDep = Annotated[ShopSettingsService, Depends(get_shop_settings_service)]
