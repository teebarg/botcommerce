import asyncio
from datetime import datetime, timezone

import bcrypt
from faker import Faker
from prisma import Prisma
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker()
db = Prisma()


def slugify(name: str) -> str:
    return name.lower().replace(" ", "-")


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

CUSTOMERS = [
    {"email": "admin@revoque.ng", "role": "ADMIN", "first_name": "Admin", "last_name": "User"},
    {"email": "customer1@revoque.ng", "role": "CUSTOMER", "first_name": "Chidi", "last_name": "Okafor"},
    {"email": "customer2@revoque.ng", "role": "CUSTOMER", "first_name": "Amara", "last_name": "Nwosu"},
    {"email": "customer3@revoque.ng", "role": "CUSTOMER", "first_name": "Tunde", "last_name": "Bakare"},
]


async def seed_users():
    logger.info("Seeding users...")
    hashed_password = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    users = {}
    for u in CUSTOMERS:
        user = await db.user.upsert(
            where={"email": u["email"]},
            data={
                "create": {
                    "first_name": u["first_name"],
                    "last_name": u["last_name"],
                    "email": u["email"],
                    "hashed_password": hashed_password,
                    "role": u["role"],
                    "status": "ACTIVE",
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {},
            },
        )
        users[u["email"]] = user

        # Address book — no unique key on Address, so clear + recreate per user
        await db.address.delete_many(where={"user_id": user.id})
        await db.address.create(
            data={
                "user_id": user.id,
                "label": "Home",
                "address_type": "HOME",
                "first_name": u["first_name"],
                "last_name": u["last_name"],
                "address_1": fake.street_address(),
                "city": fake.city(),
                "state": "Lagos",
                "phone": "+2348012345678",
                "is_billing": True,
            }
        )

    return users


# ---------------------------------------------------------------------------
# Categories & Collections
# ---------------------------------------------------------------------------

async def seed_categories():
    logger.info("Seeding categories...")
    for cat in [
        {"name": "Shoes", "slug": "shoes"},
        {"name": "Clothing", "slug": "clothing"},
    ]:
        await db.category.upsert(
            where={"slug": cat["slug"]},
            data={
                "create": {**cat, "is_active": True, "created_at": datetime.now(timezone.utc)},
                "update": {},
            },
        )


async def seed_collections():
    logger.info("Seeding collections...")
    for col in [
        {"name": "Summer Sale", "slug": "summer-sale"},
        {"name": "New Arrivals", "slug": "new-arrivals"},
    ]:
        await db.collection.upsert(
            where={"slug": col["slug"]},
            data={
                "create": {**col, "is_active": True, "created_at": datetime.now(timezone.utc)},
                "update": {},
            },
        )


# ---------------------------------------------------------------------------
# Products — 1 product : 1 image : 1 variant, brand/tags left null
# ---------------------------------------------------------------------------

PRODUCT_TEMPLATES = [
    {"name": "Classic White Sneakers", "category": "shoes", "price": 28000, "old_price": 34000, "size": "42", "color": "White", "inventory": 12},
    {"name": "Leather Ankle Boots", "category": "shoes", "price": 42000, "old_price": None, "size": "40", "color": "Brown", "inventory": 0},
    {"name": "Suede Loafers", "category": "shoes", "price": 35000, "old_price": None, "size": "41", "color": "Tan", "inventory": 8},
    {"name": "Running Trainers", "category": "shoes", "price": 31000, "old_price": 39000, "size": "43", "color": "Black", "inventory": 25},
    {"name": "Canvas High-Tops", "category": "shoes", "price": 24000, "old_price": None, "size": "39", "color": "White", "inventory": 0},
    {"name": "Formal Oxford Shoes", "category": "shoes", "price": 45000, "old_price": 52000, "size": "42", "color": "Black", "inventory": 6},
    {"name": "Slide Sandals", "category": "shoes", "price": 12000, "old_price": None, "size": "41", "color": "Black", "inventory": 40},
    {"name": "Native Palm Slippers", "category": "shoes", "price": 15000, "old_price": 18000, "size": "42", "color": "Brown", "inventory": 0},
    {"name": "Ankara Print Shirt", "category": "clothing", "price": 18000, "old_price": None, "size": "M", "color": "Multicolor", "inventory": 15},
    {"name": "Agbada Set", "category": "clothing", "price": 65000, "old_price": 75000, "size": "L", "color": "White", "inventory": 3},
    {"name": "Slim Fit Denim Jeans", "category": "clothing", "price": 22000, "old_price": None, "size": "32", "color": "Blue", "inventory": 0},
    {"name": "Oversized Hoodie", "category": "clothing", "price": 20000, "old_price": 25000, "size": "L", "color": "Grey", "inventory": 18},
    {"name": "Linen Kaftan", "category": "clothing", "price": 27000, "old_price": None, "size": "M", "color": "Sand", "inventory": 9},
    {"name": "Bomber Jacket", "category": "clothing", "price": 38000, "old_price": 45000, "size": "M", "color": "Black", "inventory": 0},
    {"name": "Cotton Polo Shirt", "category": "clothing", "price": 14000, "old_price": None, "size": "L", "color": "Navy", "inventory": 30},
    {"name": "Wrap Ankara Dress", "category": "clothing", "price": 26000, "old_price": 31000, "size": "M", "color": "Multicolor", "inventory": 5},
    {"name": "Tailored Trousers", "category": "clothing", "price": 23000, "old_price": None, "size": "34", "color": "Charcoal", "inventory": 0},
    {"name": "Senator Wear Set", "category": "clothing", "price": 40000, "old_price": 48000, "size": "L", "color": "Wine", "inventory": 14},
]


async def seed_products():
    logger.info("Seeding products...")
    products = []

    for idx, tpl in enumerate(PRODUCT_TEMPLATES, start=1):
        slug = slugify(str(tpl.get("name", "test")))
        sku = f"SKU-{idx:04d}"

        product = await db.product.upsert(
            where={"slug": slug},
            data={
                "create": {
                    "name": tpl["name"],
                    "slug": slug,
                    "sku": sku,
                    "description": fake.paragraph(nb_sentences=3),
                    "active": True,
                    "is_new": fake.boolean(chance_of_getting_true=25),
                    "ratings": round(fake.pyfloat(min_value=3, max_value=5), 1),
                    "categories": {"connect": [{"slug": tpl["category"]}]},
                },
                "update": {},
            },
        )
        products.append(product)

        # 1 image per product
        await db.productimage.delete_many(where={"product_id": product.id})
        await db.productimage.create(
            data={
                "product_id": product.id,
                "image": f"https://picsum.photos/seed/{slug}/800/1000",
                "order": 1,
            }
        )

        # 1 variant per product — status derives from inventory
        variant_sku = f"{sku}-V1"
        status = "OUT_OF_STOCK" if tpl["inventory"] == 0 else "IN_STOCK"
        await db.productvariant.upsert(
            where={"sku": variant_sku},
            data={
                "create": {
                    "product_id": product.id,
                    "sku": variant_sku,
                    "status": status,
                    "price": tpl["price"],
                    "old_price": tpl["old_price"],
                    "inventory": tpl["inventory"],
                    "size": tpl["size"],
                    "color": tpl["color"],
                },
                "update": {},
            },
        )

    return products


# ---------------------------------------------------------------------------
# Shop config: settings, delivery options, bank details, coupons, banners, FAQs
# ---------------------------------------------------------------------------

async def seed_shop_settings():
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
            data={"create": setting, "update": {}},
        )


async def seed_delivery_options():
    logger.info("Seeding delivery options...")
    for option in [
        {"name": "Standard Shipping", "description": "Delivered within 5-7 days", "amount": 3000, "method": "STANDARD", "duration": "5-7 business days"},
        {"name": "Express Shipping", "description": "Delivered within 2-3 days", "amount": 5000, "method": "EXPRESS", "duration": "2-3 business days"},
        {"name": "Store Pickup", "description": "Pickup at our store", "amount": 0, "method": "PICKUP", "duration": "Ready in 1 hour"},
    ]:
        await db.deliveryoption.upsert(
            where={"name": option["name"]},
            data={"create": {**option, "is_active": True}, "update": {}},
        )


async def seed_bank_details():
    logger.info("Seeding bank details...")
    await db.bankdetails.delete_many()
    await db.bankdetails.create(
        {
            "bank_name": "Citi Bank",
            "account_name": "John Doe",
            "account_number": "0123456789",
        }
    )


async def seed_coupons():
    logger.info("Seeding coupons...")
    for coupon in [
        {"code": "WELCOME10", "discount_type": "PERCENTAGE", "discount_value": 10, "max_uses": 1000, "max_uses_per_user": 1},
        {"code": "FLAT2000", "discount_type": "FIXED_AMOUNT", "discount_value": 2000, "min_cart_value": 15000, "max_uses": 500, "max_uses_per_user": 1},
    ]:
        await db.coupon.upsert(
            where={"code": coupon["code"]},
            data={"create": {**coupon, "scope": "GENERAL", "is_active": True}, "update": {}},
        )


async def seed_carousel_banners():
    logger.info("Seeding carousel banners...")
    await db.carouselbanner.delete_many()
    await db.carouselbanner.create_many(
        data=[
            {"title": "Summer Sale", "subtitle": "Up to 30% off", "buttonText": "Shop Now", "link": "/collections/summer-sale", "order": 1, "is_active": True},
            {"title": "New Arrivals", "subtitle": "Fresh drops weekly", "buttonText": "Explore", "link": "/collections/new-arrivals", "order": 2, "is_active": True},
        ]
    )


async def seed_faqs():
    logger.info("Seeding FAQs...")
    for faq in [
        {"question": "How long does delivery take?", "answer": "Standard delivery takes 5-7 business days.", "category": "Shipping"},
        {"question": "What payment methods do you accept?", "answer": "We accept card, bank transfer, and cash on delivery.", "category": "Payments"},
        {"question": "Can I return an item?", "answer": "Yes, within 7 days of delivery in original condition.", "category": "Returns"},
    ]:
        await db.faq.upsert(
            where={"question": faq["question"]},
            data={"create": {**faq, "is_active": True}, "update": {}},
        )


# ---------------------------------------------------------------------------
# Shared collections (needs products to exist first)
# ---------------------------------------------------------------------------

async def seed_shared_collections(products):
    logger.info("Seeding shared collections...")
    for col in [
        {"title": "Summer Sale", "slug": "summer-sale", "description": "Summer Sale"},
        {"title": "New Arrivals", "slug": "new-arrivals", "description": "New Arrivals"},
    ]:
        await db.sharedcollection.upsert(
            where={"slug": col["slug"]},
            data={
                "create": {
                    **col,
                    "is_active": True,
                    "products": {"connect": [{"id": p.id} for p in products]},
                    "created_at": datetime.now(timezone.utc),
                },
                "update": {},
            },
        )


# ---------------------------------------------------------------------------
# Reviews & favorites (needs users + products)
# ---------------------------------------------------------------------------

async def seed_reviews_and_favorites(users, products):
    logger.info("Seeding reviews and favorites...")
    customer = users["customer1@revoque.ng"]

    for product in products[:4]:
        await db.review.upsert(
            where={"user_id_product_id": {"user_id": customer.id, "product_id": product.id}},
            data={
                "create": {
                    "user_id": customer.id,
                    "product_id": product.id,
                    "author": customer.first_name,
                    "comment": fake.sentence(nb_words=12),
                    "rating": fake.random_int(min=3, max=5),
                    "verified": True,
                },
                "update": {},
            },
        )

    for product in products[4:7]:
        await db.favorite.upsert(
            where={"user_id_product_id": {"user_id": customer.id, "product_id": product.id}},
            data={"create": {"user_id": customer.id, "product_id": product.id}, "update": {}},
        )


# ---------------------------------------------------------------------------
# Sample cart + order (needs users + product variants)
# ---------------------------------------------------------------------------

async def seed_cart_and_order(users, products):
    logger.info("Seeding sample cart and order...")
    customer = users["customer2@revoque.ng"]
    address = await db.address.find_first(where={"user_id": customer.id})

    variant_a = await db.productvariant.find_first(where={"product_id": products[0].id})
    variant_b = await db.productvariant.find_first(where={"product_id": products[1].id})

    # Active cart, idempotent via cart_number
    cart = await db.cart.upsert(
        where={"cart_number": "DEV-CART-0001"},
        data={
            "create": {
                "cart_number": "DEV-CART-0001",
                "user_id": customer.id,
                "status": "ACTIVE",
                "subtotal": variant_a.price,
                "total": variant_a.price,
                "shipping_address_id": address.id,
                "billing_address_id": address.id,
            },
            "update": {"status": "ACTIVE"},
        },
    )
    await db.cartitem.delete_many(where={"cart_id": cart.id})
    await db.cartitem.create(
        data={
            "cart_id": cart.id,
            "cart_number": cart.cart_number,
            "variant_id": variant_a.id,
            "name": products[0].name,
            "slug": products[0].slug,
            "quantity": 1,
            "price": variant_a.price,
        }
    )

    # Completed order, idempotent via order_number
    order = await db.order.upsert(
        where={"order_number": "DEV-ORDER-0001"},
        data={
            "create": {
                "order_number": "DEV-ORDER-0001",
                "user_id": customer.id,
                "email": customer.email,
                "shipping_address_id": address.id,
                "billing_address_id": address.id,
                "subtotal": variant_b.price,
                "tax": round(variant_b.price * 0.075, 2),
                "shipping_fee": 3000,
                "total": variant_b.price + 3000 + round(variant_b.price * 0.075, 2),
                "status": "DELIVERED",
                "payment_method": "PAYSTACK",
                "payment_status": "SUCCESS",
                "shipping_method": "STANDARD",
            },
            "update": {},
        },
    )
    await db.orderitem.delete_many(where={"order_id": order.id})
    await db.orderitem.create(
        data={
            "order_id": order.id,
            "variant_id": variant_b.id,
            "name": products[1].name,
            "quantity": 1,
            "price": variant_b.price,
        }
    )
    await db.payment.upsert(
        where={"order_id": order.id},
        data={
            "create": {
                "order_id": order.id,
                "amount": order.total,
                "payment_method": "PAYSTACK",
                "status": "SUCCESS",
                "reference": "DEV-REF-0001",
                "transaction_id": "DEV-TXN-0001",
            },
            "update": {},
        },
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def seed():
    await db.connect()

    users = await seed_users()
    await seed_categories()
    await seed_collections()
    products = await seed_products()
    await seed_shop_settings()
    await seed_delivery_options()
    await seed_bank_details()
    await seed_coupons()
    await seed_carousel_banners()
    await seed_faqs()
    await seed_shared_collections(products)
    await seed_reviews_and_favorites(users, products)
    await seed_cart_and_order(users, products)

    await db.disconnect()
    logger.info("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
