# import asyncio
# from datetime import datetime, timedelta
# import random
# from faker import Faker
# import bcrypt
# from prisma import Prisma
# import logging

# # from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed


# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# max_tries = 60 * 5  # 5 minutes
# wait_seconds = 1

# fake = Faker()


# # @retry(
# #     stop=stop_after_attempt(max_tries),
# #     wait=wait_fixed(wait_seconds),
# #     before=before_log(logger, logging.INFO),
# #     after=after_log(logger, logging.WARN),
# # )
# async def seed_database():
#     db = Prisma()
#     await db.connect()

#     print("Database seeding started...")

#     # Clear existing data
#     await db.user.delete_many()
#     await db.address.delete_many()
#     await db.brand.delete_many()
#     await db.category.delete_many()
#     await db.collection.delete_many()
#     await db.product.delete_many()
#     await db.productvariant.delete_many()
#     await db.coupon.delete_many()
#     await db.deliveryoption.delete_many()
#     await db.shopsettings.delete_many()

#     # Seed Users
#     async def create_user(email, role="CUSTOMER"):
#         hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
#         return await db.user.create({
#             "first_name": fake.first_name(),
#             "last_name": fake.last_name(),
#             "email": email,
#             "hashed_password": hashed_password,
#             "role": role,
#             "status": "ACTIVE",
#             "created_at": datetime.now(),
#         })

#     admin = await create_user("teebarg01@gmail.com", "ADMIN")
#     customers = [
#         await create_user(f"customer{i}@email.com")
#         for i in range(1, 6)
#     ]

#     # Seed Brands
#     brands = [
#         await db.brand.create({
#             "name": name,
#             "slug": name.lower().replace(" ", "-"),
#             "is_active": True,
#             "created_at": datetime.now()
#         })
#         for name in ["Nike", "Adidas", "Puma", "Under Armour", "Reebok"]
#     ]

#     # Seed Categories
#     categories_data = [
#         {"name": "Clothing", "slug": "clothing"},
#         {"name": "Shoes", "slug": "shoes"},
#         {"name": "Accessories", "slug": "accessories"}
#     ]
#     categories = [
#         await db.category.create({
#             **data,
#             "is_active": True,
#             "created_at": datetime.now()
#         })
#         for data in categories_data
#     ]

#     # Seed Collections
#     collections = [
#         await db.collection.create({
#             "name": name,
#             "slug": name.lower().replace(" ", "-"),
#             "is_active": True,
#             "created_at": datetime.now()
#         })
#         for name in ["Summer Sale", "Winter Collection", "Best Sellers"]
#     ]

#     # Seed Products
#     products_data = [
#         {"name": "Running Shoes", "sku": "RUN123"},
#         {"name": "Sports T-Shirt", "sku": "TSH123"},
#         {"name": "Gym Bag", "sku": "GMB123"},
#         {"name": "Training Shorts", "sku": "TS123"},
#     ]

#     products = []
#     for product_data in products_data:
#         product = await db.product.create({
#             "name": product_data["name"],
#             "sku": product_data["sku"],
#             "slug": product_data["name"].lower().replace(" ", "-"),
#             "description": fake.text(max_nb_chars=200),
#             "image": f"http://localhost/images/{product_data['name'].lower().replace(' ', '-')}.jpg",
#             "status": "IN_STOCK",
#             "ratings": round(random.uniform(3.0, 5.0), 1),
#             "created_at": datetime.now()
#         })

#         # Connect relations
#         await db.product.update(
#             where={"id": product.id},
#             data={
#                 "brand": {"connect": {"id": random.choice(brands).id}},
#                 "categories": {"connect": [{"id": random.choice(categories).id}]},
#                 "collections": {"connect": [{"id": random.choice(collections).id}]}
#             }
#         )
#         products.append(product)

#     # Seed Product Variants
#     for product in products:
#         for size in ["S", "M", "L"]:
#             await db.productvariant.create({
#                 "product": {"connect": {"id": product.id}},
#                 "sku": f"{product.slug.upper()}-{size}-{random.randint(1000, 9999)}",
#                 "status": "IN_STOCK",
#                 "price": random.randint(100, 1000),
#                 "old_price": random.randint(100, 1000),
#                 "size": size,
#                 "color": "Black",
#                 "inventory": random.randint(10, 100),
#                 "created_at": datetime.now()
#             })

#     # Seed Addresses
#     for customer in customers:
#         await db.address.create({
#             "user": {"connect": {"id": customer.id}},
#             "first_name": customer.first_name,
#             "last_name": customer.last_name,
#             "address_1": fake.street_address(),
#             "city": fake.city(),
#             "state": fake.state(),
#             "postal_code": fake.postcode(),
#             "phone": fake.phone_number(),
#             "is_billing": True,
#             "created_at": datetime.now()
#         })

#     # Seed Coupons
#     coupons = [
#         await db.coupon.create({
#             "code": code,
#             "discount_type": dtype,
#             "discount_value": value,
#             "expiration_date": datetime.now() + timedelta(days=30),
#             "created_at": datetime.now()
#         })
#         for code, dtype, value in [
#             ("SAVE10", "PERCENTAGE", 10.0),
#             ("FLAT5", "FIXED_AMOUNT", 5.0),
#             ("WELCOME15", "PERCENTAGE", 15.0)
#         ]
#     ]

#     # Seed Delivery Options
#     delivery_options = [
#         await db.deliveryoption.create({
#             "name": name,
#             "description": description,
#             "method": method,
#             "amount": amount,
#             "is_active": True,
#             "created_at": datetime.now()
#         })
#         for name, description, method, amount in [
#             ("Standard Delivery", "Delivery within 3-5 business days.", "STANDARD", 2500),
#             ("Express Delivery", "Delivery within 2 business days.", "EXPRESS", 5000),
#             ("Pickup", "Pickup at store", "PICKUP", 0)
#         ]
#     ]

#     # Seed Reviews
#     for product in products:
#         for _ in range(5):
#             await db.review.create({
#                 "product": {"connect": {"id": product.id}},
#                 "user": {"connect": {"id": random.choice(customers).id}},
#                 "rating": random.randint(1, 5),
#                 "author": random.choice(customers).first_name,
#                 "title": fake.sentence(nb_words=3),
#                 "comment": fake.text(max_nb_chars=200),
#                 "created_at": datetime.now()
#             })

    
#     # Seed Orders
#     for customer in customers:
#         for _ in range(5):
#             await db.order.create({
#                 "user": {"connect": {"id": customer.id}},
#                 "status": "PAID",
#                 "created_at": datetime.now()
#             })

#     orders = await db.order.find_many()

#     # Seed Order Items
#     for order in orders:
#         for _ in range(5):
#             await db.orderitem.create({
#                 "order": {"connect": {"id": order.id}},
#                 "product": {"connect": {"id": random.choice(products).id}},
#                 "quantity": random.randint(1, 5),
#                 "created_at": datetime.now()
#             })


#     # Seed Shop settings
#     for setting in [
#         {"key": "shop_name", "value": "The Bot Store", "type": "SHOP_DETAIL"},
#         {"key": "address", "value": "123 Main St", "type": "SHOP_DETAIL"},
#         {"key": "contact_phone", "value": "+234123456789", "type": "SHOP_DETAIL"},
#         {"key": "contact_email", "value": "shop@example.com", "type": "SHOP_DETAIL"},
#         {"key": "shop_description", "value": "Shop Description", "type": "SHOP_DETAIL"},
#         {"key": "tax_rate", "value": "7.5", "type": "SHOP_DETAIL"},
#         {"key": "shop_email", "value": "shop@example.com", "type": "SHOP_DETAIL"},
#         {"key": "whatsapp", "value": "+234123456789", "type": "SHOP_DETAIL"},
#         {"key": "facebook", "value": "https://facebook.com", "type": "SHOP_DETAIL"},
#         {"key": "instagram", "value": "https://instagram.com", "type": "SHOP_DETAIL"},
#         {"key": "tiktok", "value": "https://tiktok.com", "type": "SHOP_DETAIL"},
#         {"key": "twitter", "value": "https://twitter.com", "type": "SHOP_DETAIL"},
#     ]:
#         await db.shopsettings.create({
#             "key": setting["key"],
#             "value": setting["value"],
#             "type": setting["type"],
#             "created_at": datetime.now()
#         })

#     # Seed Bank Accounts
#     await db.bankdetails.create({
#         "bank_name": "Bank Account",
#         "account_name": "Bank Account Description",
#         "account_number": "Bank Account Description",
#         "created_at": datetime.now()
#     })

#     print("Database seeding completed successfully!")
#     await db.disconnect()

# if __name__ == "__main__":
#     asyncio.run(seed_database())



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


async def seed_database():
    db = Prisma()
    await db.connect()
    print("Database seeding started...")

    async def upsert_user(email, role="CUSTOMER"):
        hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        return await db.user.upsert(
            where={"email": email},
            update={},
            create={
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "email": email,
                "hashed_password": hashed_password,
                "role": role,
                "status": "ACTIVE",
                "created_at": datetime.now(),
            },
        )

    admin = await upsert_user("teebarg01@gmail.com", "ADMIN")
    customers = [
        await upsert_user(f"customer{i}@email.com")
        for i in range(1, 6)
    ]

    async def upsert_brand(name):
        slug = name.lower().replace(" ", "-")
        return await db.brand.upsert(
            where={"slug": slug},
            update={},
            create={
                "name": name,
                "slug": slug,
                "is_active": True,
                "created_at": datetime.now()
            },
        )

    brands = [
        await upsert_brand(name)
        for name in ["Nike", "Adidas", "Puma", "Under Armour", "Reebok"]
    ]

    async def upsert_category(name, slug):
        return await db.category.upsert(
            where={"slug": slug},
            update={},
            create={
                "name": name,
                "slug": slug,
                "is_active": True,
                "created_at": datetime.now()
            },
        )

    categories = [
        await upsert_category(data["name"], data["slug"])
        for data in [
            {"name": "Clothing", "slug": "clothing"},
            {"name": "Shoes", "slug": "shoes"},
            {"name": "Accessories", "slug": "accessories"}
        ]
    ]

    async def upsert_collection(name):
        slug = name.lower().replace(" ", "-")
        return await db.collection.upsert(
            where={"slug": slug},
            update={},
            create={
                "name": name,
                "slug": slug,
                "is_active": True,
                "created_at": datetime.now()
            },
        )

    collections = [
        await upsert_collection(name)
        for name in ["Summer Sale", "Winter Collection", "Best Sellers"]
    ]

    products_data = [
        {"name": "Running Shoes", "sku": "RUN123"},
        {"name": "Sports T-Shirt", "sku": "TSH123"},
        {"name": "Gym Bag", "sku": "GMB123"},
        {"name": "Training Shorts", "sku": "TS123"},
    ]

    products = []
    for data in products_data:
        slug = data["name"].lower().replace(" ", "-")
        product = await db.product.upsert(
            where={"sku": data["sku"]},
            update={},
            create={
                "name": data["name"],
                "sku": data["sku"],
                "slug": slug,
                "description": fake.text(max_nb_chars=200),
                "image": f"http://localhost/images/{slug}.jpg",
                "status": "IN_STOCK",
                "ratings": round(random.uniform(3.0, 5.0), 1),
                "created_at": datetime.now(),
            },
        )
        await db.product.update(
            where={"id": product.id},
            data={
                "brand": {"connect": {"id": random.choice(brands).id}},
                "categories": {"connect": [{"id": random.choice(categories).id}]},
                "collections": {"connect": [{"id": random.choice(collections).id}]}
            },
        )
        products.append(product)

    for product in products:
        for size in ["S", "M", "L"]:
            sku = f"{product.slug.upper()}-{size}-{random.randint(1000, 9999)}"
            await db.productvariant.upsert(
                where={"sku": sku},
                update={},
                create={
                    "product": {"connect": {"id": product.id}},
                    "sku": sku,
                    "status": "IN_STOCK",
                    "price": random.randint(100, 1000),
                    "old_price": random.randint(100, 1000),
                    "size": size,
                    "color": "Black",
                    "inventory": random.randint(10, 100),
                    "created_at": datetime.now()
                },
            )

    for customer in customers:
        await db.address.upsert(
            where={"user_id": customer.id},  # Assuming unique index on user_id
            update={},
            create={
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
            },
        )

    for code, dtype, value in [
        ("SAVE10", "PERCENTAGE", 10.0),
        ("FLAT5", "FIXED_AMOUNT", 5.0),
        ("WELCOME15", "PERCENTAGE", 15.0),
    ]:
        await db.coupon.upsert(
            where={"code": code},
            update={},
            create={
                "code": code,
                "discount_type": dtype,
                "discount_value": value,
                "expiration_date": datetime.now() + timedelta(days=30),
                "created_at": datetime.now()
            },
        )

    for name, description, method, amount in [
        ("Standard Delivery", "Delivery within 3-5 business days.", "STANDARD", 2500),
        ("Express Delivery", "Delivery within 2 business days.", "EXPRESS", 5000),
        ("Pickup", "Pickup at store", "PICKUP", 0)
    ]:
        await db.deliveryoption.upsert(
            where={"method": method},
            update={},
            create={
                "name": name,
                "description": description,
                "method": method,
                "amount": amount,
                "is_active": True,
                "created_at": datetime.now()
            },
        )

    for setting in [
        {"key": "shop_name", "value": "The Bot Store"},
        {"key": "address", "value": "123 Main St"},
        {"key": "contact_phone", "value": "+234123456789"},
        {"key": "contact_email", "value": "shop@example.com"},
        {"key": "shop_description", "value": "Shop Description"},
        {"key": "tax_rate", "value": "7.5"},
        {"key": "shop_email", "value": "shop@example.com"},
        {"key": "whatsapp", "value": "+234123456789"},
        {"key": "facebook", "value": "https://facebook.com"},
        {"key": "instagram", "value": "https://instagram.com"},
        {"key": "tiktok", "value": "https://tiktok.com"},
        {"key": "twitter", "value": "https://twitter.com"},
    ]:
        await db.shopsettings.upsert(
            where={"key": setting["key"]},
            update={},
            create={
                "key": setting["key"],
                "value": setting["value"],
                "type": "SHOP_DETAIL",
                "created_at": datetime.now()
            },
        )

    await db.bankdetails.upsert(
        where={"account_number": "Bank Account Description"},
        update={},
        create={
            "bank_name": "Bank Account",
            "account_name": "Bank Account Description",
            "account_number": "Bank Account Description",
            "created_at": datetime.now()
        },
    )

    print("Database seeding completed successfully!")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_database())
    