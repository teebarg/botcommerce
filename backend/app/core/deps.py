from typing import Annotated, Generator, Union

import firebase_admin
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from firebase_admin import credentials, storage
from google.cloud.storage.bucket import Bucket
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app import crud
from app.core import security
from app.core.config import settings
from app.core.logging import logger
from app.crud.search import SearchService, get_search_service
from app.db.engine import engine
from app.models.generic import Address, Product, User
from app.models.token import TokenPayload
from app.services.cache import CacheService, get_cache_service
from app.services.notification import NotificationService, EmailChannel, SlackChannel

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)


def get_db() -> Generator:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
# TokenDep = Annotated[str, Depends(reusable_oauth2)]
TokenDep = Annotated[Union[str, None], Depends(APIKeyHeader(name="X-Auth"))]


def get_storage() -> Generator:
    try:
        if not firebase_admin._apps:  # Check if the app is not already initialized
            cred = credentials.Certificate(settings.FIREBASE_CRED)
            firebase_admin.initialize_app(
                cred, {"storageBucket": settings.STORAGE_BUCKET}
            )

        # Get a reference to the bucket
        yield storage.bucket()
    except Exception as e:
        logger.error(f"storage init error, {e}")
        raise
    finally:
        logger.debug("storage closed")


Storage = Annotated[Bucket, Depends(get_storage)]


async def get_current_user(session: SessionDep, access_token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            access_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from None
    user = await crud.user.get_by_email(db=session, email=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
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


def get_address_param(id: str, db: SessionDep, current_user: CurrentUser) -> Address:
    if address := crud.address.get(db=db, id=id):
        if not current_user.is_superuser and current_user.id != address.user_id:
            raise HTTPException(
                status_code=401, detail="Unauthorized to access this address."
            )
        return address
    raise HTTPException(status_code=404, detail="Address not found.")


CurrentAddress = Annotated[User, Depends(get_address_param)]


def get_product_path_param(id: str, db: SessionDep) -> Product:
    if product := crud.product.get(db=db, id=id):
        return product
    raise HTTPException(status_code=404, detail="Product not found.")


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


AdminUser = Annotated[User, Depends(get_current_active_superuser)]

CacheService = Annotated[CacheService, Depends(get_cache_service)]
SearchService = Annotated[SearchService, Depends(get_search_service)]

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
