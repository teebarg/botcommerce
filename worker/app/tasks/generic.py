from core.notifications import Channel, ContactForm

from core.logging import get_logger

async def contact_form(ctx, name: str, email: str, phone: str, message: str):
    notification_srv = ctx["notification_srv"]
    await notification_srv.send(
        ContactForm(
            name=name,
            email=email,
            phone=phone,
            message=message,
        ),
        channels=[
            Channel.EMAIL,
            Channel.SLACK
        ],
    )