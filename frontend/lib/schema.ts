import { z } from "zod";

const CustomerSchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    is_active: z.boolean().optional(),
    is_superuser: z.number().optional(),
    created_at: z.string().optional(),
    billing_addresses: z.array(z.record(z.any())).optional(),
    shipping_addresses: z.array(z.record(z.any())).optional(),
});

const ReviewSchema = z.object({
    id: z.number(),
    rating: z.number(),
    comment: z.string(),
    verified: z.boolean().optional(),
    product_id: z.number(),
    created_at: z.string(),
    user: CustomerSchema,
});

export const ProductSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    price: z.number(),
    old_price: z.number(),
    image: z.string(),
    images: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
    ratings: z.number().optional(),
    inventory: z.number().optional(),
    created_at: z.string().optional(),
    collections: z.array(z.string()),
    reviews: z.array(ReviewSchema).optional(),
});

const BrandSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean().optional(),
    created_at: z.string(),
});

const CollectionSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean().optional(),
    created_at: z.string(),
});

const UserSchema = z.object({
    id: z.number(),
    firstname: z.string(),
    email: z.string().email(),
    role: z.string(),
    status: z.string(),
    created_at: z.string(),
});

const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

const CartItemSchema = z.object({
    item_id: z.string(),
    product_id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    quantity: z.number(),
    price: z.number(),
    created_at: z.string(),
});

const CartSchema = z.object({
    cart_id: z.string(),
    customer_id: z.string(),
    email: z.string().email(),
    items: z.array(CartItemSchema),
    checkout_step: z.enum(["address", "delivery", "payment"]).optional(),
    subtotal: z.number(),
    tax_total: z.number(),
    discount_total: z.number(),
    delivery_fee: z.number(),
    total: z.number(),
    billing_address: z.record(z.any()),
    shipping_address: z.record(z.any()),
    shipping_method: z.any(),
    payment_session: z.any(),
    gift_cards: z.any(),
});

const DeliveryOptionSchema = z.object({
    id: z.string(),
    name: z.string(),
    amount: z.number(),
});

const PaymentSessionSchema = z.object({
    id: z.string(),
    provider_id: z.string(),
});

const OrderSchema = z.object({
    order_id: z.string(),
    status: z.enum(["pending", "processing", "fulfilled"]).optional(),
    fulfillment_status: z.enum(["fulfilled", "not_fulfilled"]),
    cart_id: z.string(),
    customer_id: z.string(),
    email: z.string().email(),
    line_items: z.array(CartItemSchema),
    checkout_step: z.enum(["address", "delivery", "payment"]).optional(),
    subtotal: z.number(),
    tax_total: z.number(),
    delivery_fee: z.number(),
    total: z.number(),
    billing_address: z.record(z.any()),
    shipping_address: z.record(z.any()),
    shipping_method: z.record(z.any()),
    payment_session: z.record(z.any()),
    fulfillments: z.array(z.record(z.any())),
    payment_status: z.enum(["pending", "paid"]),
    created_at: z.string(),
});

const AddressSchema = z.object({
    created_at: z.string(),
    updated_at: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    postal_code: z.string(),
    state: z.string(),
    phone: z.string(),
    id: z.string(),
});

const CategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string().optional(),
    is_active: z.boolean(),
    children: z.any(),
    parent_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});

const SearchParamsSchema = z.object({
    query: z.string().optional(),
    categories: z.string().optional(),
    collections: z.string().optional(),
    min_price: z.union([z.number(), z.string()]).optional(),
    max_price: z.union([z.number(), z.string()]).optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
});

const WishlistItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    user_id: z.number().optional(),
    product_id: z.number().optional(),
    image: z.string(),
    created_at: z.string().optional(),
});

const SiteConfigSchema = z.object({
    id: z.number(),
    key: z.string(),
    value: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedProductSchema = z.object({
    products: z.array(ProductSchema),
    facets: z
        .object({
            brands: z.record(z.string()).optional(),
            categories: z.record(z.string()).optional(),
            collections: z.record(z.string()).optional(),
        })
        .optional(),
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});
