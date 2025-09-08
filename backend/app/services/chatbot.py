from app.prisma_client import prisma as db
from typing import Optional, List

async def get_relevant_faqs(user_message: str) -> str:
    """
    Get relevant FAQ entries based on the user message
    """
    try:
        query_terms = [term.lower()
                       for term in user_message.split() if len(term) > 3]

        all_faqs = []
        for term in query_terms:
            faqs = await db.faq.find_many(
                where={
                    "OR": [
                        {"question": {"contains": term, "mode": "insensitive"}},
                        {"answer": {"contains": term, "mode": "insensitive"}}
                    ],
                    "is_active": True
                },
                take=3
            )

            all_faqs.extend(faqs)

        if not all_faqs:
            return ""

        seen_faqs = set()
        unique_faqs = []

        for faq in all_faqs:
            if faq.id not in seen_faqs:
                seen_faqs.add(faq.id)
                unique_faqs.append(faq)

        # Limit to top 3 FAQs
        unique_faqs = unique_faqs[:3]

        faq_info = ""
        for faq in unique_faqs:
            faq_info += f"Q: {faq.question}\n"
            faq_info += f"A: {faq.answer}\n\n"

        return faq_info
    except Exception as e:
        print(f"Error fetching FAQs: {str(e)}")
        return ""


async def enhance_prompt_with_data(user_message: str, user_id: Optional[int] = None):
    """
    Enhance the system prompt with relevant data from the database based on user query
    Returns: (enhanced_info, related_entity_type, related_entity_id)
    """
    enhanced_info = []
    query_terms = [term.lower() for term in user_message.split()]

    product_intent_patterns = ['do you have', 'is there', 'can i get', 'i want to buy','show me',
                               'have you got', 'is the', 'do you sell', 'looking for', 'find me', 'i need a']
    product_patterns = ["product", "buy", "purchase", "latest products", "latest items", "products", 'bestsellers', 'deals', 'trending', 'new arrivals', 'available']
    category_patterns = ["category", "categories", "type", "types", "group"]
    # brand_patterns = ["brand", "make", "manufacturer"]
    cart_patterns = ["cart", "basket", "bag", "add to cart", "checkout"]
    shipping_patterns = ["shipping", "delivery", "send", "track"]
    payment_patterns = ["payment", "pay", "credit card",
                        "cash", "bank transfer", "paystack"]

    if any(pattern in user_message.lower() for pattern in product_intent_patterns):
        products_info, product_id = await get_relevant_products(query_terms=query_terms, product_intent=True)
        if products_info:
            enhanced_info.append(
                "Available products for the customer's query:")
            enhanced_info.append(products_info)

    if any(pattern in user_message.lower() for pattern in product_patterns):
        products_info, product_id = await get_relevant_products(query_terms=query_terms, trending=True)
        if products_info:
            enhanced_info.append(
                "Relevant products that might answer the customer's query:")
            enhanced_info.append(products_info)

    # Check for category related queries
    if any(pattern in user_message.lower() for pattern in category_patterns):
        categories_info, category_id = await get_categories_info(query_terms)
        if categories_info:
            enhanced_info.append("Category information that might be helpful:")
            enhanced_info.append(categories_info)

    # Check for brand related queries
    # if any(pattern in user_message.lower() for pattern in brand_patterns):
    #     brands_info, brand_id = await get_brands_info(query_terms)
    #     if brands_info:
    #         enhanced_info.append("Brand information that might be helpful:")
    #         enhanced_info.append(brands_info)

    # Check for cart related queries (if user_id is provided)
    if user_id and any(pattern in user_message.lower() for pattern in cart_patterns):
        cart_info, cart_id = await get_user_cart_info(user_id)
        if cart_info:
            enhanced_info.append("Customer's current cart information:")
            enhanced_info.append(cart_info)

    # Check for shipping related queries
    if any(pattern in user_message.lower() for pattern in shipping_patterns):
        shipping_info = "Our store offers the following shipping methods:\n"
        shipping_info += "- STANDARD: Regular delivery (typically 3-5 business days)\n"
        shipping_info += "- EXPRESS: Expedited delivery (typically 1-2 business days)\n"
        shipping_info += "- PICKUP: In-store pickup option (available same day if item is in stock)"
        enhanced_info.append(shipping_info)

    # Check for payment related queries
    if any(pattern in user_message.lower() for pattern in payment_patterns):
        payment_info = "Our store accepts the following payment methods:\n"
        payment_info += "- CREDIT_CARD: All major credit cards accepted\n"
        payment_info += "- CASH_ON_DELIVERY: Pay when your order arrives\n"
        payment_info += "- BANK_TRANSFER: Pay via bank transfer (order processing begins after payment confirmation)\n"
        payment_info += "- PAYSTACK: Online payment via Paystack"
        enhanced_info.append(payment_info)

    return "\n\n".join(enhanced_info)


async def get_relevant_products(query_terms: List[str], product_intent: bool = False, trending: bool = False) -> tuple[str, Optional[str]]:
    """
    Get relevant products based on query terms from the database
    Returns: (product_info_text, top_product_id)
    """
    try:
        all_products = []

        if product_intent:
            for term in query_terms:
                if len(term) < 3:
                    continue

                products = await db.product.find_many(
                    where={
                        "OR": [
                            {"name": {"contains": term, "mode": "insensitive"}},
                            {"description": {"contains": term, "mode": "insensitive"}},
                            {"slug": {"contains": term, "mode": "insensitive"}}
                        ]
                    },
                    include={
                        "variants": True,
                        "categories": True,
                        "images": True
                    },
                    take=5
                )

                all_products.extend(products)

        elif trending:
            products = await db.product.find_many(
                where={"collections": {"name": "Trending"}},
                include={
                    "variants": True,
                    "categories": True,
                    "images": True
                },
                take=5
            )

            all_products.extend(products)

        if not all_products:
            return "", None

        seen_products = set()
        unique_products = []

        for product in all_products:
            if product.id not in seen_products:
                seen_products.add(product.id)
                unique_products.append(product)

        # Limit to top 3 products
        # unique_products = unique_products[:3]

        top_product_id = str(
            unique_products[0].id) if unique_products else None

        product_info = ""
        for product in unique_products:
            name = product.name
            price = product.variants[0].price
            image = product.images[0].image if product.images else product.image

            product_info += f"""---
            ![{name}]({image})
            **🛍️ {name}**
            💵 **Price:** ₦{price}
            🔗 [View Product](/products/{product.slug})
            """

            if product.description:
                description = product.description[:100] + "..." if len(
                    product.description) > 100 else product.description
                product_info += f"Description: {description}\n"

            product_info += "\n"

        return product_info, top_product_id
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return "", None


async def get_categories_info(query_terms: List[str]) -> tuple[str, Optional[str]]:
    """
    Get category information based on query terms
    Returns: (category_info_text, top_category_id)
    """
    try:
        all_categories = []

        for term in query_terms:
            if len(term) < 3:
                continue

            categories = await db.category.find_many(
                where={
                    "OR": [
                        {"name": {"contains": term, "mode": "insensitive"}},
                        {"slug": {"contains": term, "mode": "insensitive"}}
                    ]
                },
                include={
                    "subcategories": True,
                    "products": {
                        "take": 3
                    }
                }
            )

            all_categories.extend(categories)

        if not all_categories:
            return "", None

        seen_categories = set()
        unique_categories = []

        for category in all_categories:
            if category.id not in seen_categories:
                seen_categories.add(category.id)
                unique_categories.append(category)

        # Limit to top 3 categories
        unique_categories = unique_categories[:3]

        # Get top category ID for relation tracking
        top_category_id = str(
            unique_categories[0].id) if unique_categories else None

        category_info = ""
        for category in unique_categories:
            category_info += f"- {category.name}\n"

            if category.subcategories and len(category.subcategories) > 0:
                subcats = ", ".join(
                    [subcat.name for subcat in category.subcategories])
                category_info += f"  Subcategories: {subcats}\n"

            if category.products and len(category.products) > 0:
                category_info += "  Popular products in this category:\n"
                for product in category.products[:3]:  # Limit to 3 products
                    category_info += f"    - {product.name}: ₦{product.variants[0].price}\n"

            category_info += "\n"

        return category_info, top_category_id
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        return "", None


# async def get_brands_info(query_terms: List[str]) -> tuple[str, Optional[str]]:
#     """
#     Get brand information based on query terms
#     Returns: (brand_info_text, top_brand_id)
#     """
#     try:
#         all_brands = []

#         for term in query_terms:
#             if len(term) < 3:
#                 continue

#             brands = await db.brand.find_many(
#                 where={
#                     "OR": [
#                         {"name": {"contains": term, "mode": "insensitive"}},
#                         {"slug": {"contains": term, "mode": "insensitive"}}
#                     ]
#                 },
#                 include={
#                     "products": {
#                         "take": 3
#                     }
#                 }
#             )

#             all_brands.extend(brands)

#         if not all_brands:
#             return "", None

#         # Deduplicate brands
#         seen_brands = set()
#         unique_brands = []

#         for brand in all_brands:
#             if brand.id not in seen_brands:
#                 seen_brands.add(brand.id)
#                 unique_brands.append(brand)

#         # Limit to top 3 brands
#         unique_brands = unique_brands[:3]

#         # Get top brand ID for relation tracking
#         top_brand_id = str(unique_brands[0].id) if unique_brands else None

#         # Format brand information
#         brand_info = ""
#         for brand in unique_brands:
#             brand_info += f"- {brand.name}\n"

#             if brand.products and len(brand.products) > 0:
#                 brand_info += "  Popular products from this brand:\n"
#                 for product in brand.products[:3]:  # Limit to 3 products
#                     brand_info += f"    - {product.name}: ₦{product.variants[0].price}\n"

#             brand_info += "\n"

#         return brand_info, top_brand_id
#     except Exception as e:
#         print(f"Error fetching brands: {str(e)}")
#         return "", None


async def get_user_cart_info(user_id: int) -> tuple[str, Optional[str]]:
    """
    Get information about the user's active cart
    Returns: (cart_info_text, cart_id)
    """
    try:
        cart = await db.cart.find_first(
            where={
                "user_id": user_id,
                "status": "ACTIVE"
            },
            include={
                "items": {
                    "include": {
                        "variant": True
                    }
                },
                "shipping_address": True
            }
        )

        if not cart:
            return "The customer currently has no active cart.", None

        # Format cart information
        cart_info = f"Cart #{cart.cart_number}:\n"

        if cart.items and len(cart.items) > 0:
            cart_info += "Items in cart:\n"
            for item in cart.items:
                cart_info += f"- {item.name} (x{item.quantity}): ₦{item.price} each\n"

            cart_info += f"\nSubtotal: ₦{cart.subtotal}\n"
            cart_info += f"Shipping: ₦{cart.shipping_cost}\n"
            cart_info += f"Total: ₦{cart.total}\n"

            if cart.shipping_address:
                cart_info += "\nShipping Address:\n"
                cart_info += f"{cart.shipping_address.address}\n"
                cart_info += f"{cart.shipping_address.city}, {cart.shipping_address.state}\n"
                cart_info += f"{cart.shipping_address.zip_code}\n"

            return cart_info, str(cart.id)

        # If no active cart is found, return a message
        return "The customer currently has no active cart.", None
    except Exception as e:
        print(f"Error fetching cart information: {str(e)}")
        return "The customer currently has no active cart.", None
