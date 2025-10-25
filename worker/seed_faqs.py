import asyncio
import asyncpg
from datetime import datetime

DATABASE_URL = "postgres://admin:password@postgres:5432/tbo"

FAQS = [
    # 🧥 Products & Sizing
    ("What types of clothes do you sell?",
     "Thriftbyoba offers a wide selection of both thrift and brand-new clothing for men, women, and children. Our collections include casual wear, formal outfits, and unique thrift finds that help you express your personal style.",
     "Products & Sizing"),

    ("How can I find the right size?",
     "Each product page includes a detailed size chart. We recommend checking your measurements before ordering. If you need help choosing, our support team is happy to guide you.",
     "Products & Sizing"),

    ("Do your clothes fit true to size?",
     "Most of our items fit true to size, but some thrift pieces may vary slightly. We always include size notes in each product description.",
     "Products & Sizing"),

    ("Are your kids’ clothes safe and durable?",
     "Yes. Our children’s clothing is made with comfortable, skin-friendly materials that are designed for durability and everyday wear.",
     "Products & Sizing"),

    # 📦 Orders & Shipping
    ("How do I place an order?",
     "Browse our website, add your favorite thrift or new items to your cart, and proceed to checkout. You can pay securely and choose your preferred delivery method.",
     "Orders & Shipping"),

    ("Can I change or cancel my order after placing it?",
     "If your order has not been processed or shipped, you can contact our customer support to modify or cancel it. Once shipped, orders can no longer be changed.",
     "Orders & Shipping"),

    ("How long does delivery take?",
     "Delivery usually takes 2–5 business days within Lagos and 3–7 business days to other states in Nigeria. You’ll receive a tracking number once your order ships.",
     "Orders & Shipping"),

    ("Do you offer same-day or express delivery?",
     "Yes, we offer same-day and express delivery options within Lagos for orders placed before 12 PM. You’ll see available delivery options at checkout.",
     "Orders & Shipping"),

    # 💳 Payments
    ("What payment methods do you accept?",
     "We accept debit/credit cards, bank transfers, and mobile payment options. You can also pay on delivery within Lagos.",
     "Payments"),

    ("Is my payment information secure?",
     "Yes. Thriftbyoba uses secure payment gateways and SSL encryption to ensure your data is protected at all times.",
     "Payments"),

    # 🔁 Returns & Exchanges
    ("What is your return policy?",
     "We accept returns and exchanges within 7 days of delivery, provided items are unworn, unwashed, and in their original condition with tags attached.",
     "Returns & Exchanges"),

    ("How do I start a return?",
     "To request a return, contact our support team with your order number. We’ll guide you through the process and help arrange pickup or drop-off.",
     "Returns & Exchanges"),

    ("Do you offer refunds?",
     "Yes. Once your returned item is received and inspected, we’ll process your refund within 3–5 business days to your original payment method.",
     "Returns & Exchanges"),

    # 👩‍💻 Account & Support
    ("Do I need an account to shop?",
     "You can check out as a guest, but creating an account lets you track orders, save addresses, and receive updates on new arrivals and sales.",
     "Account & Support"),

    ("How can I contact customer support?",
     "You can reach our team via WhatsApp, email, or Instagram DM. Our support hours are 9 AM to 6 PM, Monday to Saturday.",
     "Account & Support"),

    # 🌍 Store Policies & Sustainability
    ("Do you ship nationwide?",
     "Yes! We deliver anywhere in Nigeria, from Lagos to Abuja, Port Harcourt, Ibadan, and beyond.",
     "Store Policies"),

    ("Where is your physical store located?",
     "Our physical store is located in Ishaga, Lagos. You can shop in person or order online for nationwide delivery.",
     "Store Policies"),

    ("Do you restock sold-out thrift items?",
     "Since most thrift pieces are one-of-a-kind, restocks are rare. However, new thrift drops are added weekly — follow us on Instagram or sign up for updates to get notified first!",
     "Store Policies"),
]


async def seed_faqs():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        for question, answer, category in FAQS:
            await conn.execute("""
                INSERT INTO faqs (question, answer, category, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, true, $4, $4)
                ON CONFLICT (question) DO NOTHING;
            """, question, answer, category, datetime.utcnow())

        print("✅ FAQs successfully seeded into the database for Thriftbyoba!")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed_faqs())
