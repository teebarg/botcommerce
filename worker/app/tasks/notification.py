from core.logging import get_logger
from core.notifications import CampaignEvent, Channel, PushEvent
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
    trust_note: str | None = None,
    cta_text: str | None = "Shop Now",
    cta_url: str | None = "/cllections",
    eyebrow: str | None = "",
    preheader: str | None = ""
) -> None:
    notification_srv = ctx["notification_srv"]
    pool = ctx["db_pool"]

    async with pool.acquire() as conn:
        product_rows = await conn.fetch(
            """
            SELECT DISTINCT ON (p.id)
                p.id, p.name, p.image, p.slug, pv.price, pv.old_price
            FROM products p
            JOIN product_variants pv ON pv.product_id = p.id
            WHERE p.id = ANY($1::int[])
            ORDER BY p.id, pv.price ASC
            """,
            product_ids,
        )

        recipient_rows = await conn.fetch(
            """
            SELECT id, email
            FROM users
            WHERE status = 'active'
            LIMIT 1
            """,
        )
        print("🚀 ~ process_email_campaign ~ recipient_rows:", recipient_rows)

    products = [
        CampaignProduct(
            name=row["name"] or "",
            image=row["image"] or "",
            price=row["price"],
            old_price=row["old_price"],
            url=f"/products/{row['slug']}",
        )
        for row in product_rows
    ]

    results = await notification_srv.send(
        CampaignEvent(
            receipients=[row["email"] for row in recipient_rows],
            subject=subject,
            template="marketing_campaign.html",
            data={
                "subject": subject,
                "heading": heading,
                "intro": intro,
                "hero_image": hero_image,
                "preheader": preheader,        # new — short, ~90 char inbox preview text
                "eyebrow": eyebrow,            # new — optional, e.g. "48 HOURS ONLY"
                "cta_url": cta_url,            # new — e.g. link to your collection page
                "cta_text": cta_text,          # new — defaults to "Shop Now"
                "trust_note": trust_note,      # new — e.g. "Free delivery on orders over ₦X"
                "products": products,
                "unsubscribe_url": "/unsubscribe",
            }
        ),
        channels=[Channel.EMAIL],
    )
    print("🚀 ~ process_email_campaign ~ results:", results)
    mail_results = results.get(Channel.EMAIL, [])
    print("🚀 ~ process_email_campaign ~ results:", mail_results)

    failures = [
        (row["email"], result)
        for row, result in zip(recipient_rows, mail_results)
        if result is not None
    ]

    if failures:
        logger.warning("Email campaign had %d failed sends", len(failures))
