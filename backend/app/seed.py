import asyncio
from prisma import Prisma
from datetime import datetime

import asyncio
from datetime import datetime, timedelta
import random
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

    # await db.productvariant.delete_many()
    await db.bankdetails.delete_many()

    # 1. Users
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
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )


    admin = await upsert_user("teebarg01@gmail.com", "ADMIN")
    customers = [
        await upsert_user(f"customer{i}@email.com")
        for i in range(1, 6)
    ]

    # 2. Brands
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
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )

    # 3. Categories
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
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )

    # 4. Collections
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
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )

    # 5. Products
    logger.info("Seeding products...")
    sample_products = [
        {
            "name": "Air Max",
            "sku": "RUN1233",
            "slug": "air-max",
            "description": "Comfy running shoes",
            "brand_slug": "nike",
            "category_slugs": ["shoes"],
            "collection_slugs": ["summer-sale"],
            "variants": [
                {"sku": "airmax-42", "price": 12000, "old_price": 15000, "size": "42", "color": "Black", "inventory": 10},
                {"sku": "airmax-43", "price": 12000, "old_price": 15000, "size": "43", "color": "White", "inventory": 8},
            ]
        },
        {
            "name": "Sports T-Shirt",
            "sku": "TSH1234",
            "slug": "sports-t-shirt",
            "description": "Comfortable sports t-shirt",
            "brand_slug": "adidas",
            "category_slugs": ["clothing"],
            "collection_slugs": ["new-arrivals"],
            "variants": [
                {"sku": "tshirt-m", "price": 5000, "old_price": 6000, "size": "M", "color": "Red", "inventory": 15},
                {"sku": "tshirt-l", "price": 5000, "old_price": 6000, "size": "L", "color": "Blue", "inventory": 12},
            ]
        },
    ]

    for p in sample_products:
        brand = await db.brand.find_unique(where={"slug": p["brand_slug"]})
        categories = await db.category.find_many(where={"slug": {"in": p["category_slugs"]}})
        collections = await db.collection.find_many(where={"slug": {"in": p["collection_slugs"]}})

        await db.product.upsert(
            where={"slug": p["slug"]},
            data={
                "create": {
                    "name": p["name"],
                    "sku": p["sku"],
                    "slug": p["slug"],
                    "description": p["description"],
                    "brand": {"connect": {"id": brand.id}},
                    "categories": {"connect": [{"id": c.id} for c in categories]},
                    "collections": {"connect": [{"id": c.id} for c in collections]},
                    "variants": {"create": p["variants"]},
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )

    # 6. Coupons
    logger.info("Seeding coupons...")
    for code, dtype, value in [
            ("SAVE10", "PERCENTAGE", 10.0),
            ("FLAT5", "FIXED_AMOUNT", 5.0),
            ("WELCOME15", "PERCENTAGE", 15.0)
        ]:
        await db.coupon.upsert(
            where={"code": code},
            data={
                "create": {
                    "code": code,
                    "discount_type": dtype,
                    "discount_value": value,
                    "expiration_date": datetime.now() + timedelta(days=30),
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )

    # 7. Settings
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
        {"key": "facebook", "value": "https://facebook.com", "type": "SHOP_DETAIL"},
        {"key": "instagram", "value": "https://instagram.com", "type": "SHOP_DETAIL"},
        {"key": "tiktok", "value": "https://tiktok.com", "type": "SHOP_DETAIL"},
        {"key": "twitter", "value": "https://twitter.com", "type": "SHOP_DETAIL"},
    ]:
        await db.shopsettings.upsert(
            where={"key": setting["key"]},
            data={
                "create": {"key": setting["key"], "value": setting["value"], "type": setting["type"]},
                "update": {}
            }
        )


    # 9. Delivery Options
    logger.info("Seeding delivery options...")
    delivery_options = [
        {"name": "Standard Shipping", "description": "Your order will be delivered within 5-7 days", "amount": 3000, "method": "STANDARD"},
        {"name": "Express Shipping", "description": "Your order will be delivered within 2-3 days", "amount": 5000, "method": "EXPRESS"},
        {"name": "Pickup", "description": "Pickup at our store", "amount": 0, "method": "PICKUP"},
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
                    "is_active": True
                },
                "update": {}
            }
        )

    # 10. Bank Details
    logger.info("Seeding bank details...")
    await db.bankdetails.create({
        "bank_name": "Citi Bank",
        "account_name": "John Doe",
        "account_number": "0123456789",
    })

    # Shared collections
    logger.info("Seeding shared collections...")
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
                    "created_at": datetime.now(datetime.timezone.utc),
                },
                "update": {}
            }
        )

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())
