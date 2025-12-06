import { z } from "zod";

import { ConversationStatusSchema, MessageSenderSchema } from "./enums";
import { UserSchema } from "./user";
import { PagSchema } from "./common";

export const ChatMessageSchema = z.object({
    id: z.number(),
    conversation_id: z.number(),
    content: z.string(),
    sender: MessageSenderSchema,
    timestamp: z.string(),
});

export const ChatSchema = z.object({
    id: z.number(),
    conversation_uuid: z.string(),
    user_id: z.number(),
    user: UserSchema,
    messages: z.array(ChatMessageSchema),
    started_at: z.string(),
    last_active: z.string(),
    status: ConversationStatusSchema,
});

export const PaginatedChatSchema = PagSchema.extend({
    chats: z.array(ChatSchema),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type PaginatedChat = z.infer<typeof PaginatedChatSchema>;
