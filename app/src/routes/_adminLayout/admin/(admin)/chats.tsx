import { createFileRoute } from "@tanstack/react-router";
import { ConversationStatusSchema } from "@/schemas";
import z from "zod";

export const Route = createFileRoute("/_adminLayout/admin/(admin)/chats")({
    validateSearch: z.object({
        status: ConversationStatusSchema.optional(),
    }),
});
