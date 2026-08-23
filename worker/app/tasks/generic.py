from core.notifications import Channel, ContactForm, NewsletterEvent, BulkPurchaseEvent


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


async def process_newsletter(ctx, email: str):
    notification_srv = ctx["notification_srv"]
    await notification_srv.send(
        NewsletterEvent(customer_email=email),
        channels=[Channel.EMAIL],
    )


async def process_bulk_purchase(ctx,  name: str, email: str, phone: str, message: str, bulkType: str, quantity):
    notification_srv = ctx["notification_srv"]
    await notification_srv.send(
        BulkPurchaseEvent(
            name=name,
            email=email,
            phone=phone,
            message=message,
            bulkType=bulkType,
            quantity=quantity,
        ),
        channels=[Channel.EMAIL, Channel.SLACK],
    )
