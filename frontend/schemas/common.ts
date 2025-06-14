import { z } from "zod";

import { ConversationStatusSchema, MessageSenderSchema, ShippingMethodSchema, ShopSettingsTypeSchema } from "./enums";
import { UserSchema } from "./user";

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

export const ChatMessageSchema = z.object({
    id: z.number(),
    conversation_id: z.number(),
    content: z.string(),
    sender: MessageSenderSchema,
    timestamp: z.string(),
});

export const ConversationSchema = z.object({
    id: z.number(),
    conversation_uuid: z.string(),
    user_id: z.number(),
    user: UserSchema,
    messages: z.array(ChatMessageSchema),
    started_at: z.string(),
    last_active: z.string(),
    status: ConversationStatusSchema,
});

export const PaginatedConversationSchema = PagSchema.extend({
    conversations: z.array(ConversationSchema),
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

export const ActivitySchema = z.object({
    id: z.number(),
    user_id: z.number(),
    activity_type: z.string(),
    description: z.string(),
    action_download_url: z.string().optional(),
    is_success: z.boolean(),
    user: UserSchema,
    created_at: z.string(),
    updated_at: z.string(),
});

export const PaginatedActivitySchema = PagSchema.extend({
    activities: z.array(ActivitySchema),
});

export const DeliveryOptionSchema = z.object({
    id: ShippingMethodSchema,
    name: z.string(),
    amount: z.number(),
    amount_str: z.string(),
    description: z.string(),
});

export type Pagination = z.infer<typeof PaginationSchema>;
export type DeliveryOption = z.infer<typeof DeliveryOptionSchema>;

export type Token = z.infer<typeof TokenSchema>;
export type Pag = z.infer<typeof PagSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type PaginatedSiteConfig = z.infer<typeof PaginatedSiteConfigSchema>;
export type ShopSettings = z.infer<typeof ShopSettingsSchema>;
export type BankDetails = z.infer<typeof BankDetailsSchema>;
export type PaystackResponse = z.infer<typeof PaystackResponseSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type PaginatedConversation = z.infer<typeof PaginatedConversationSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type PaginatedActivity = z.infer<typeof PaginatedActivitySchema>;
