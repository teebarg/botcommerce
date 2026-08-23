from datetime import datetime, timedelta
import uuid
from app.db import session_factory
from core.notifications import Channel, TestCreated, Welcome
from core.repositories.coupon_repository import CouponRepository
from core.repositories.user_repository import UserRepository
from core.logging import get_logger

logger = get_logger(__name__)

async def test_email(ctx):
    notification_srv = ctx["notification_srv"]
    await notification_srv.send(
        TestCreated(
            email="teebarg01@gmail.com",
        ),
        channels=[
            Channel.EMAIL,
            Channel.SLACK,
        ],
    )
