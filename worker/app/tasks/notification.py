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
    cta_text: str | None = "Shop Now",
    cta_url: str | None = "/collections",
    eyebrow: str | None = "",
    preheader: str | None = "",
    urgency_text: str | None = "🔥 FLASH SALE — 48 HOURS ONLY",
    trust_badges: list[str] = None
) -> None:
    if trust_badges is None:
        trust_badges = ["🚚 Free delivery", "↩ Easy returns", "🔒 Secure checkout"]
    notification_srv = ctx["notification_srv"]
    pool = ctx["db_pool"]

    async with pool.acquire() as conn:
        product_rows = await conn.fetch(
            """
            SELECT DISTINCT ON (p.id)
                p.id, p.name, p.slug, pv.price, pv.old_price, img.image AS image
            FROM products p
            JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN LATERAL (
                SELECT pi.image
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY pi.order ASC
                LIMIT 1
            ) img ON TRUE
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
                "preheader": preheader,
                "eyebrow": eyebrow,
                "cta_url": cta_url,
                "cta_text": cta_text,
                "products": products,
                "unsubscribe_url": "/unsubscribe",
                "urgency_text": urgency_text,
                "trust_badges": trust_badges,
            }
        ),
        channels=[Channel.EMAIL],
    )
    mail_results = results.get(Channel.EMAIL, [])

    failures = [
        (row["email"], result)
        for row, result in zip(recipient_rows, mail_results)
        if result is not None
    ]

    if failures:
        logger.warning("Email campaign had %d failed sends", len(failures))
