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

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type PaginatedConversation = z.infer<typeof PaginatedConversationSchema>;
