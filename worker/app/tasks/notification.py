from core.logging import get_logger
from core.notifications import Channel, Mail, PushEvent
from core.notifications.base import CampaignProduct, PushSubscription
from core.notifications.channels.push import PushSubscriptionExpired

logger = get_logger(__name__)


async def process_push_notification(ctx, payload: dict, subscription_ids: list[str]):
    notification_srv = ctx["notification_srv"]
    pool = ctx["db_pool"]
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, endpoint, p256dh, auth
            FROM push_subscriptions
            WHERE id = ANY($1::text[])
            """,
            subscription_ids,
        )

        results = await notification_srv.send(
            PushEvent(
                subscriptions=[
                    PushSubscription(
                        endpoint=row["endpoint"], p256dh=row["p256dh"], auth=row["auth"]
                    )
                    for row in rows
                ],
                title=payload["title"],
                body=payload["body"],
                path=payload.get("path", "/collections"),
                imageUrl=payload.get("imageUrl", None),
                data=payload.get("data", {}),
            ),
            channels=[Channel.PUSH],
        )
        push_results = results.get(Channel.PUSH, [])

        expired_ids = [
            row["id"]
            for row, result in zip(rows, push_results)
            if isinstance(result, PushSubscriptionExpired)
        ]

        if expired_ids:
            await conn.execute(
                "DELETE FROM push_subscriptions WHERE id = ANY($1::text[])",
                expired_ids,
            )

async def process_email_campaign(
    ctx,
    subject: str,
    heading: str | None,
    intro: str | None,
    hero_image: str | None,
    product_ids: list[str],
) -> None:
    email_channel = ctx["email_channel"]
    pool = ctx["db_pool"]

    async with pool.acquire() as conn:
        product_rows = await conn.fetch(
            """
            SELECT name, image, price, discount_price, url
            FROM products
            WHERE id = ANY($1::text[])
            """,
            product_ids,
        )

        recipient_rows = await conn.fetch(
            """
            SELECT id, email
            FROM customers
            WHERE subscribed_to_marketing = true
            """,
        )

    products = [
        CampaignProduct(
            name=row["name"],
            image=row["image"],
            price=row["price"],
            discount_price=row["discount_price"],
            url=row["url"],
        )
        for row in product_rows
    ]

    mails = [
        Mail(
            to=row["email"],
            subject=subject,
            template="marketing_campaign.html",
            data={
                "subject": subject,
                "heading": heading,
                "intro": intro,
                "hero_image": hero_image,
                "products": products,
                "unsubscribe_url": f"/unsubscribe?customer_id={row['id']}",
            },
        )
        for row in recipient_rows
    ]

    results = await email_channel.send_many(mails)

    failures = [
        (row["email"], result)
        for row, result in zip(recipient_rows, results)
        if result is not None
    ]

    if failures:
        logger.warning("Email campaign had %d failed sends", len(failures))
