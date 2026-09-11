from core.logging import get_logger
from core.notifications import Channel, TestCreated

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
