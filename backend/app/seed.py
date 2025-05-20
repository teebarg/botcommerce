import asyncio
from datetime import datetime, timedelta
import random
from faker import Faker
import bcrypt
from prisma import Prisma
import logging

# from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1

fake = Faker()


# @retry(
#     stop=stop_after_attempt(max_tries),
#     wait=wait_fixed(wait_seconds),
#     before=before_log(logger, logging.INFO),
#     after=after_log(logger, logging.WARN),
# )
async def seed_database():
    db = Prisma()
    await db.connect()

    print("Database seeding started...")

    # Clear existing data
    await db.user.delete_many()
    await db.address.delete_many()
    await db.brand.delete_many()
    await db.category.delete_many()
    await db.collection.delete_many()
    await db.product.delete_many()
    await db.productvariant.delete_many()
    await db.coupon.delete_many()

    # Seed Users
    async def create_user(email, role="CUSTOMER"):
        hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        return await db.user.create({
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "email": email,
            "hashed_password": hashed_password,
            "role": role,
            "status": "ACTIVE",
            "created_at": datetime.now(),
        })

    admin = await create_user("admin@email.com", "ADMIN")
    customers = [
        await create_user(f"customer{i}@email.com")
        for i in range(1, 6)
    ]

    # Seed Brands
    brands = [
        await db.brand.create({
            "name": name,
            "slug": name.lower().replace(" ", "-"),
            "is_active": True,
            "created_at": datetime.now()
        })
        for name in ["Nike", "Adidas", "Puma", "Under Armour", "Reebok"]
    ]

    # Seed Categories
    categories_data = [
        {"name": "Clothing", "slug": "clothing"},
        {"name": "Shoes", "slug": "shoes"},
        {"name": "Accessories", "slug": "accessories"}
    ]
    categories = [
        await db.category.create({
            **data,
            "is_active": True,
            "created_at": datetime.now()
        })
        for data in categories_data
    ]

    # Seed Collections
    collections = [
        await db.collection.create({
            "name": name,
            "slug": name.lower().replace(" ", "-"),
            "is_active": True,
            "created_at": datetime.now()
        })
        for name in ["Summer Sale", "Winter Collection", "Best Sellers"]
    ]

    # Seed Products
    products_data = [
        {"name": "Running Shoes", "price": 99.99, "old_price": 129.99, "sku": "RUN123"},
        {"name": "Sports T-Shirt", "price": 29.99, "old_price": 39.99, "sku": "TSH123"},
        {"name": "Gym Bag", "price": 49.99, "old_price": 59.99, "sku": "GMB123"},
        {"name": "Training Shorts", "price": 34.99, "old_price": 44.99, "sku": "TS123"},
    ]

    products = []
    for product_data in products_data:
        product = await db.product.create({
            "name": product_data["name"],
            "sku": product_data["sku"],
            "slug": product_data["name"].lower().replace(" ", "-"),
            "description": fake.text(max_nb_chars=200),
            "price": product_data["price"],
            "old_price": product_data["old_price"],
            "image": f"http://localhost/images/{product_data['name'].lower().replace(' ', '-')}.jpg",
            "status": "IN_STOCK",
            "ratings": round(random.uniform(3.0, 5.0), 1),
            "created_at": datetime.now()
        })

        # Connect relations
        await db.product.update(
            where={"id": product.id},
            data={
                "brand": {"connect": {"id": random.choice(brands).id}},
                "categories": {"connect": [{"id": random.choice(categories).id}]},
                "collections": {"connect": [{"id": random.choice(collections).id}]}
            }
        )
        products.append(product)

    # Seed Product Variants
    for product in products:
        for size in ["S", "M", "L"]:
            await db.productvariant.create({
                "product": {"connect": {"id": product.id}},
                "name": f"{product.name} - {size}",
                "slug": f"{product.slug}-{size.lower()}",
                "sku": f"{product.slug.upper()}-{size}-{random.randint(1000, 9999)}",
                "status": "IN_STOCK",
                "price": product.price + random.uniform(-5, 5),
                "old_price": product.old_price,
                "inventory": random.randint(10, 100),
                "created_at": datetime.now()
            })

    # Seed Addresses
    for customer in customers:
        await db.address.create({
            "user": {"connect": {"id": customer.id}},
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "address_1": fake.street_address(),
            "city": fake.city(),
            "state": fake.state(),
            "postal_code": fake.postcode(),
            "phone": fake.phone_number(),
            "is_billing": True,
            "created_at": datetime.now()
        })

    # Seed Coupons
    coupons = [
        await db.coupon.create({
            "code": code,
            "discount_type": dtype,
            "discount_value": value,
            "expiration_date": datetime.now() + timedelta(days=30),
            "created_at": datetime.now()
        })
        for code, dtype, value in [
            ("SAVE10", "PERCENTAGE", 10.0),
            ("FLAT5", "FIXED_AMOUNT", 5.0),
            ("WELCOME15", "PERCENTAGE", 15.0)
        ]
    ]

    print("Database seeding completed successfully!")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_database())