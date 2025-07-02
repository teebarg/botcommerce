import { z } from "zod";

import { ShippingMethodSchema, ShopSettingsTypeSchema } from "./enums";

export const TokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string().default("bearer"),
});

export const PagSchema = z.object({
    page: z.number(),
    skip: z.number().optional(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

export const MessageSchema = z.object({
    message: z.string(),
    error: z.boolean().default(false),
});

export const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
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

export type Pagination = z.infer<typeof PaginationSchema>;
export type DeliveryOption = z.infer<typeof DeliveryOptionSchema>;
export type ImageUpload = z.infer<typeof ImageUploadSchema>;

export type Token = z.infer<typeof TokenSchema>;
export type Pag = z.infer<typeof PagSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type PaginatedSiteConfig = z.infer<typeof PaginatedSiteConfigSchema>;
export type ShopSettings = z.infer<typeof ShopSettingsSchema>;
export type BankDetails = z.infer<typeof BankDetailsSchema>;
export type PaystackResponse = z.infer<typeof PaystackResponseSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
