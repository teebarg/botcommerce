from core.logging import get_logger
from core.notifications import CampaignEvent, Channel, TestCreated
from core.notifications.base import CampaignProduct

logger = get_logger(__name__)

async def process_test_email(ctx):
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


async def process_test_campaign(ctx):
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
            [235, 236, 230, 231],
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

    await notification_srv.send(
        CampaignEvent(
            receipients=["HNEW771740d18b7f64abecb636@send.emltest.uk", "teebarg01@gmail.com"],
            subject="The One-Piece Wonder Your Wardrobe Needs ⚡ 20% Off All Jumpsuits",
            template="marketing_campaign.html",
            data={
                "subject": "The One-Piece Wonder Your Wardrobe Needs ⚡ 20% Off All Jumpsuits",
                "heading": "Effortless Style, Infinite Possibilities",
                "intro": "Say goodbye to 'nothing to wear' moments. From desk-ready tailoring to weekend casual chic, our jumpsuit collection delivers maximum style with minimal effort. Snag your new favorite one-piece before sizes sell out!",
                "hero_image": "https://jjozjybtoxqquawcnpir.supabase.co/storage/v1/object/public/campaign-images/jumpsuit_banner.jpg",
                "preheader": "Upgrade your daily uniform with our best-selling jumpsuits.",
                "eyebrow": "EXCLUSIVE WEEKEND DEAL",
                "cta_url": "/collections",
                "cta_text": "Shop Now",
                "products": products,
                "unsubscribe_url": "/unsubscribe",
                "urgency_text": "🔥 FLASH SALE — 48 HOURS ONLY",
                "trust_badges": ["🚚 Free delivery", "↩ Easy returns", "🔒 Secure checkout"],
            }
        ),
        channels=[Channel.EMAIL],
    )
