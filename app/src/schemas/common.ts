import { z } from "zod";

import { ShippingMethodSchema, ShopSettingsTypeSchema } from "./enums";

export const TokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string().default("bearer"),
});

export const CursorSchema = z.object({
    next_cursor: z.string().optional(),
    limit: z.number(),
});

export const PagSchema = z.object({
    skip: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

export const MessageSchema = z.object({
    message: z.string(),
    error: z.boolean().default(false),
});

export const ShopSettingsSchema = z.object({
    id: z.number(),
    key: z.string(),
    value: z.string().nullable(),
    type: ShopSettingsTypeSchema,
    created_at: z.string(),
    updated_at: z.string(),
});

export const BankDetailsSchema = z.object({
    id: z.number(),
    bank_name: z.string(),
    account_name: z.string(),
    account_number: z.string(),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
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

export const FAQSchema = z.object({
    id: z.number(),
    question: z.string(),
    answer: z.string(),
    category: z.string().optional(),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const DeliveryOptionSchema = z.object({
    id: ShippingMethodSchema,
    name: z.string(),
    amount: z.number(),
    amount_str: z.string(),
    description: z.string(),
});

export const ImageUploadSchema = z.object({
    file: z.string(),
    file_name: z.string(),
    content_type: z.string(),
});

const UserSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string().email(),
});

export const CouponSchema = z.object({
    id: z.number(),
    code: z.string(),
    discount_type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discount_value: z.number().min(1),
    min_cart_value: z.number().optional(),
    min_item_quantity: z.number().optional(),
    valid_from: z.string(),
    valid_until: z.string(),
    max_uses: z.number().min(1),
    max_uses_per_user: z.number().min(1),
    current_uses: z.number().optional(),
    is_active: z.boolean(),
    users: z.array(UserSchema).optional(),
    usages: z.array(z.any()).optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const CouponUsageSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    discount_amount: z.number(),
    created_at: z.string(),
});

export type DeliveryOption = z.infer<typeof DeliveryOptionSchema>;
export type ImageUpload = z.infer<typeof ImageUploadSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type CouponUsage = z.infer<typeof CouponUsageSchema>;

export type Token = z.infer<typeof TokenSchema>;
export type Pag = z.infer<typeof PagSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ShopSettings = z.infer<typeof ShopSettingsSchema>;
export type BankDetails = z.infer<typeof BankDetailsSchema>;
export type PaystackResponse = z.infer<typeof PaystackResponseSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
