import { z } from "zod";

export const TokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string().default("bearer"),
});

export const UserSchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    is_active: z.boolean().optional(),
    is_superuser: z.boolean().optional(),
    created_at: z.string().optional(),
    billing_addresses: z.array(z.record(z.any())).optional(),
    shipping_addresses: z.array(z.record(z.any())).optional(),
});

export const ReviewSchema = z.object({
    id: z.number(),
    rating: z.number(),
    comment: z.string(),
    verified: z.boolean().optional(),
    product_id: z.number(),
    created_at: z.string(),
    user: UserSchema,
});

export const PaginatedReviewSchema = z.object({
    reviews: z.array(ReviewSchema),
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

export const ProductSchema = z.object({
    id: z.number(),
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

export const PagSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

export const BrandSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean().optional(),
    created_at: z.string(),
});

export const PaginatedBrandSchema = PagSchema.extend({
    brands: z.array(BrandSchema),
});

export const CollectionSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean().optional(),
    created_at: z.string(),
});

export const PaginatedCollectionSchema = PagSchema.extend({
    collections: z.array(CollectionSchema),
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

export const CategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string().optional(),
    is_active: z.boolean().default(true),
    children: z.any().optional(),
    parent_id: z.number().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedCategorySchema = PagSchema.extend({
    categories: z.array(CategorySchema),
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

export const WishItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    user_id: z.number().optional(),
    product_id: z.number().optional(),
    image: z.string(),
    created_at: z.string().optional(),
});

export const WishlistSchema = z.object({
    wishlists: z.array(WishItemSchema),
});

const SiteConfigSchema = z.object({
    id: z.number(),
    key: z.string(),
    value: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const FacetSchema = z.object({
    brands: z.record(z.string()).optional(),
    categories: z.record(z.string()).optional(),
    collections: z.record(z.string()).optional(),
});

export const PaginatedProductSchema = PagSchema.extend({
    products: z.array(ProductSchema),
    facets: FacetSchema.optional(),
});

export const SessionSchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string(),
    image: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
});
