import { z } from "zod";

import { ConversationStatusSchema, MessageSenderSchema } from "./enums";
import { UserLiteSchema } from "./user";
import { CursorSchema } from "./common";

export const ChatMessageSchema = z.object({
    id: z.number(),
    content: z.string(),
    sender: MessageSenderSchema,
    timestamp: z.string(),
});

export const ChatSchema = z.object({
    id: z.number(),
    conversation_uuid: z.string(),
    user_id: z.number(),
    user: UserLiteSchema,
    status: ConversationStatusSchema,
    messages: z.array(ChatMessageSchema),
    started_at: z.string(),
    last_active: z.string(),
});

export const PaginatedChatsSchema = CursorSchema.extend({
    items: z.array(ChatSchema),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type PaginatedChats = z.infer<typeof PaginatedChatsSchema>;
