import asyncio
from prisma import Prisma

import asyncio
from datetime import datetime, timezone
from faker import Faker
import bcrypt
from prisma import Prisma
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker()

db = Prisma()


async def seed():
    await db.connect()
    await db.bankdetails.delete_many()

    logger.info("Seeding users...")
    async def upsert_user(email, role="CUSTOMER"):
        hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        return await db.user.upsert(
            where={"email": email},
            data={
                "create": {
                    "first_name": fake.first_name(),
                    "last_name": fake.last_name(),
                    "email": email,
                    "hashed_password": hashed_password,
                    "role": role,
                    "status": "ACTIVE",
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {}
            }
        )

    logger.info("Seeding brands...")
    brands = [
        {"name": "Nike", "slug": "nike"},
        {"name": "Adidas", "slug": "adidas"},
    ]
    for brand in brands:
        await db.brand.upsert(
            where={"slug": brand["slug"]},
            data={
                "create": {
                    "name": brand["name"],
                    "slug": brand["slug"],
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {}
            }
        )

    logger.info("Seeding categories...")
    categories = [
        {"name": "Shoes", "slug": "shoes"},
        {"name": "Clothing", "slug": "clothing"},
    ]
    for cat in categories:
        await db.category.upsert(
            where={"slug": cat["slug"]},
            data={
                "create": {
                    "name": cat["name"],
                    "slug": cat["slug"],
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {}
            }
        )

    logger.info("Seeding collections...")
    collections = [
        {"name": "Summer Sale", "slug": "summer-sale"},
        {"name": "New Arrivals", "slug": "new-arrivals"},
    ]
    for col in collections:
        await db.collection.upsert(
            where={"slug": col["slug"]},
            data={
                "create": {
                    "name": col["name"],
                    "slug": col["slug"],
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {}
            }
        )

    logger.info("Seeding settings...")
    for setting in [
        {"key": "shop_name", "value": "The Bot Store", "type": "SHOP_DETAIL"},
        {"key": "address", "value": "123 Main St", "type": "SHOP_DETAIL"},
        {"key": "contact_phone", "value": "+234123456789", "type": "SHOP_DETAIL"},
        {"key": "contact_email", "value": "shop@example.com", "type": "SHOP_DETAIL"},
        {"key": "shop_description", "value": "Shop Description", "type": "SHOP_DETAIL"},
        {"key": "tax_rate", "value": "7.5", "type": "SHOP_DETAIL"},
        {"key": "shop_email", "value": "shop@example.com", "type": "SHOP_DETAIL"},
        {"key": "whatsapp", "value": "+234123456789", "type": "SHOP_DETAIL"},
        {"key": "facebook", "value": "shop-allure", "type": "SHOP_DETAIL"},
        {"key": "instagram", "value": "shop-allure", "type": "SHOP_DETAIL"},
        {"key": "tiktok", "value": "shop-allure", "type": "SHOP_DETAIL"},
        {"key": "twitter", "value": "shop-allure", "type": "SHOP_DETAIL"},
    ]:
        await db.shopsettings.upsert(
            where={"key": setting["key"]},
            data={
                "create": {"key": setting["key"], "value": setting["value"], "type": setting["type"]},
                "update": {}
            }
        )


    logger.info("Seeding delivery options...")
    delivery_options = [
        {"name": "Standard Shipping", "description": "Your order will be delivered within 5-7 days", "amount": 3000, "method": "STANDARD", "duration": "5-7 business days"},
        {"name": "Express Shipping", "description": "Your order will be delivered within 2-3 days", "amount": 5000, "method": "EXPRESS", "duration": "2-3 business days"},
        {"name": "Store Pickup", "description": "Pickup at our store", "amount": 0, "method": "PICKUP", "duration": "Ready in 1 hour"},
    ]
    for option in delivery_options:
        await db.deliveryoption.upsert(
            where={"name": option["name"]},
            data={
                "create": {
                    "name": option["name"],
                    "description": option["description"],
                    "method": option["method"],
                    "amount": option["amount"],
                    "duration": option["duration"],
                    "is_active": True
                },
                "update": {}
            }
        )


    logger.info("Seeding bank details...")
    await db.bankdetails.create({
        "bank_name": "Citi Bank",
        "account_name": "John Doe",
        "account_number": "0123456789",
    })

    logger.info("Seeding catalogs...")
    shared_collections = [
        {"title": "Summer Sale", "slug": "summer-sale", "description": "Summer Sale", "is_active": True},
        {"title": "New Arrivals", "slug": "new-arrivals", "description": "New Arrivals", "is_active": True},
    ]
    products = await db.product.find_many()
    for col in shared_collections:
        await db.sharedcollection.upsert(
            where={"slug": col["slug"]},
            data={
                "create": {
                    "title": col["title"],
                    "slug": col["slug"],
                    "description": col["description"],
                    "is_active": col["is_active"],
                    "products": {"connect": [{"id": p.id} for p in products]},
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {}
            }
        )

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())
