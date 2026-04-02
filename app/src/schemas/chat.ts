import { z } from "zod";
import { ConversationStatusSchema, MessageSenderSchema } from "./enums";
import { UserLiteSchema } from "./user";
import { CursorSchema } from "./common";

export const ChatMessageSchema = z.object({
    id: z.number(),
    content: z.string(),
    sender: MessageSenderSchema,
    metadata: z.record(z.any()).optional(),
    timestamp: z.date(),
});

export const ChatSchema = z.object({
    id: z.number(),
    conversation_uuid: z.string(),
    user_id: z.number().optional(),
    user: UserLiteSchema.optional(),
    support_id: z.number().optional(),
    support_name: z.string().optional(),
    status: ConversationStatusSchema,
    messages: z.array(ChatMessageSchema),
    is_escalated: z.boolean().default(false),
    human_connected: z.boolean().default(false),
    started_at: z.string(),
    last_active: z.string(),
});

export const PaginatedChatsSchema = CursorSchema.extend({
    items: z.array(ChatSchema),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type PaginatedChats = z.infer<typeof PaginatedChatsSchema>;

export interface OrderItem {
    product_id: number;
    name: string;
    image?: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface OrderFinancials {
    subtotal: number;
    tax: number;
    discount: number;
    wallet_used: number;
    shipping_fee: number;
    total: number;
}

export interface OrderPayload {
    order_number: string;
    status: string;
    payment_status: string;
    payment_method?: string;
    shipping_method?: string;
    financials: OrderFinancials;
    items: OrderItem[];
    created_at: string; // ISO string
}

export interface OrderInfo {
    orderId: string;
    status: "processing" | "shipped" | "delivered" | "returned";
    items: string[];
    total: number;
    estimatedDelivery?: string;
    trackingUrl?: string;
}

export interface Product {
    name: string;
    sku: string;
    price: string;
    description: string;
    image_url: string | null;
}

export interface ChatResponse {
    reply: string;
    session_id: string;
    sources: string[];
    escalated: boolean;
    products: Product[];
    order?: any;
    quick_replies?: string[];
    form?: any;
    reaction?: "thumbs-up" | "thumbs-down" | null;
    timestamp: Date;
}
