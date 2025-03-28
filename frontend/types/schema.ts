import { z } from "zod";

// Zod Enums
export const AddressTypeSchema = z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]);

export const OrderStatusSchema = z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "PAID", "REFUNDED"]);

export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);

export const PaymentMethodSchema = z.enum(["CREDIT_CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER", "PAYSTACK"]);

export const ProductStatusSchema = z.enum(["IN_STOCK", "OUT_OF_STOCK"]);

export const CartStatusSchema = z.enum(["ACTIVE", "ABANDONED", "CONVERTED"]);

export const PaymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]);

export const ShippingMethodSchema = z.enum(["STANDARD", "EXPRESS", "PICKUP"]);

export const RoleSchema = z.enum(["admin", "customer"]);

export const StatusSchema = z.enum(["pending", "active", "inactive"]);

export const TokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string().default("bearer"),
});

export const PagSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

export const AddressSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    address_type: AddressTypeSchema,
    label: z.string().optional(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    postal_code: z.string(),
    state: z.string(),
    phone: z.string(),
    is_billing: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export const PaginatedAddressSchema = PagSchema.extend({
    addresses: z.array(AddressSchema),
});

export const CategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    image: z.string().optional(),
    is_active: z.boolean(),
    parent_id: z.number().nullable(),
    parent: z.null(),
    subcategories: z.array(z.any()).optional(),
    products: z.null(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedCategorySchema = PagSchema.extend({
    categories: z.array(CategorySchema),
});

export const UserSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string().email(),
    emailVerified: z.string(),
    status: z.string(),
    hashed_password: z.string(),
    image: z.string().optional(),
    role: z.string(),
    created_at: z.string().optional(),
    addresses: z.array(AddressSchema).optional(),
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

export const ProductVariantSchema = z.object({
    id: z.number(),
    product: z.null(),
    product_id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number(),
    inventory: z.number(),
    attributes: z.record(z.string()),
    order_items: z.null(),
    cart_items: z.null(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const ProductImageSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    image: z.string(),
    created_at: z.string().optional(),
});

export const BrandSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean(),
    products: z.null(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedBrandSchema = PagSchema.extend({
    brands: z.array(BrandSchema),
});

export const CollectionSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean(),
    products: z.null(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedCollectionSchema = PagSchema.extend({
    collections: z.array(CollectionSchema),
});

export const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

export const ProductSearchSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    price: z.number(),
    old_price: z.number(),
    image: z.string(),
    status: ProductStatusSchema,
    variants: z.array(ProductVariantSchema).nullable(),
    ratings: z.number(),
    categories: z.array(z.string()),
    collections: z.array(z.string()),
    brand: z.string(),
    tags: z.null(),
    images: z.array(z.string()),
    reviews: z.array(z.any()).nullable(),
    favorites: z.null(),
});

export const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    price: z.number(),
    old_price: z.number(),
    image: z.string(),
    status: ProductStatusSchema,
    variants: z.array(ProductVariantSchema),
    ratings: z.number(),
    categories: z.array(CategorySchema),
    collections: z.array(CollectionSchema),
    brand: BrandSchema,
    tags: z.null(),
    images: z.array(ProductImageSchema),
    reviews: z.array(ReviewSchema),
    favorites: z.null(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const CartItemSchema = z.object({
    id: z.number(),
    item_id: z.string(),
    variant_id: z.string(),
    variant: ProductVariantSchema,
    image: z.string().optional(),
    quantity: z.number(),
    price: z.number(),
    created_at: z.string(),
});

export const CartSchema = z.object({
    id: z.number(),
    cart_number: z.string(),
    user_id: z.number(),
    email: z.string().email(),
    status: z.enum(["pending", "processing", "fulfilled"]).optional(),
    items: z.array(CartItemSchema),
    checkout_step: z.enum(["address", "delivery", "payment"]).default("address").optional(),
    subtotal: z.number(),
    tax: z.number(),
    shipping_fee: z.number(),
    discount_total: z.number(),
    total: z.number(),
    billing_address: AddressSchema,
    shipping_address: AddressSchema,
    shipping_method: ShippingMethodSchema,
    payment_method: PaymentMethodSchema,
    gift_cards: z.any(),
});

export const DeliveryOptionSchema = z.object({
    id: ShippingMethodSchema,
    name: z.string(),
    amount: z.number(),
    amount_str: z.string(),
    description: z.string(),
});

export const OrderItemSchema = z.object({
    id: z.number(),
    order_id: z.number(),
    variant_id: z.string(),
    variant: ProductVariantSchema,
    image: z.string().optional(),
    quantity: z.number(),
    price: z.number(),
    created_at: z.string(),
});

export const OrderSchema = z.object({
    id: z.number(),
    order_number: z.string(),
    status: OrderStatusSchema,
    email: z.string(),
    cart_id: z.string(),
    user_id: z.number(),
    user: UserSchema,
    order_items: z.array(OrderItemSchema),
    subtotal: z.number(),
    tax: z.number(),
    shipping_fee: z.number(),
    total: z.number(),
    coupon: z.number().optional(),
    billing_address: AddressSchema,
    shipping_address: AddressSchema,
    shipping_method: ShippingMethodSchema,
    payment_method: PaymentMethodSchema,
    payment_status: PaymentStatusSchema,
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedOrderSchema = PagSchema.extend({
    orders: z.array(OrderSchema),
});

export const WishItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    user_id: z.number().optional(),
    product_id: z.number().optional(),
    product: ProductSchema,
    image: z.string(),
    created_at: z.string().optional(),
});

export const WishlistSchema = z.object({
    wishlists: z.array(WishItemSchema),
});

export const SiteConfigSchema = z.object({
    id: z.number(),
    key: z.string(),
    value: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedSiteConfigSchema = PagSchema.extend({
    configs: z.array(SiteConfigSchema),
});

export const FacetSchema = z.object({
    brand: z.record(z.string()).optional(),
    categories: z.record(z.string()).optional(),
    collections: z.record(z.string()).optional(),
});

export const PaginatedProductSearchSchema = PagSchema.extend({
    products: z.array(ProductSearchSchema),
    facets: FacetSchema.optional(),
});

export const PaginatedProductSchema = PagSchema.extend({
    products: z.array(ProductSchema),
});

export const SessionSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string(),
    image: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean(),
    isAdmin: z.boolean(),
    status: z.string(),
    role: z.string(),
});

export const MessageSchema = z.object({
    message: z.string(),
    error: z.boolean().default(false),
});

export const PaystackResponseSchema = z.object({
    message: z.string(),
    redirecturl: z.string(),
    reference: z.string(),
    status: z.string(),
    trans: z.string(),
    transaction: z.string(),
    trxref: z.string(),
});
