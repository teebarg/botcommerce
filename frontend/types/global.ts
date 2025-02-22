export type Brand = {
    id: number;
    name: string;
    slug: string;
    is_active?: boolean;
    created_at: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
};

export enum FileTypes {
    png = "image/png",
    jpeg = "image/jpeg",
    jpg = "image/jpg",
    avif = "image/avif",
    csv = "text/csv",
    xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls = "application/vnd.ms-excel",
}

export type Cart = {
    cart_id: string;
    customer_id: string;
    email: string;
    items: CartItem[];
    checkout_step?: "address" | "delivery" | "payment";
    subtotal: number;
    tax_total: number;
    discount_total: number;
    delivery_fee: number;
    total: number;
    billing_address: Record<string, any>;
    shipping_address: Record<string, any>;
    shipping_method: any;
    payment_session: any;
    gift_cards: any;
};

export type CartItem = {
    item_id: string;
    product_id: string;
    slug: string;
    name: string;
    description?: string;
    image?: string;
    quantity: number;
    price: number;
    created_at: string;
};

export type DeliveryOption = {
    id: string;
    name: string;
    amount: number;
};

export type PaymentSession = {
    id: string;
    provider_id: string;
};

export type Order = {
    order_id: string;
    status?: "pending" | "processing" | "fulfilled";
    fulfillment_status: "fulfilled" | "not_fulfilled";
    cart_id: string;
    customer_id: string;
    email: string;
    line_items: CartItem[];
    checkout_step?: "address" | "delivery" | "payment";
    subtotal: number;
    tax_total: number;
    delivery_fee: number;
    total: number;
    billing_address: Record<string, any>;
    shipping_address: Record<string, any>;
    shipping_method: Record<string, any>;
    payment_session: Record<string, any>;
    fulfillments: Record<string, any>[];
    payment_status: "pending" | "paid";
    created_at: string;
};

export type SortOptions = "price_asc" | "price_desc" | "created_at";

export type Address = {
    created_at: string;
    updated_at: string;
    firstname: string;
    lastname: string;
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
    state: string;
    phone: string;
    id: string;
};

export interface SearchParams {
    query?: string;
    categories?: string;
    collections?: string;
    min_price?: number | string;
    max_price?: number | string;
    page?: number;
    limit?: number;
    sort?: string;
}

export type SiteConfig = {
    id: number;
    key: string;
    value: string;
    created_at: string;
    updated_at: string;
};

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

const ProductSchema = z.object({
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
