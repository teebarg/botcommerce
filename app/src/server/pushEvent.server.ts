import { Message } from "@/schemas";
import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const pushEventFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            subscriberId: z.string(),
            notificationId: z.string(),
            eventType: z.enum(["DELIVERED", "OPENED", "CLICKED", "DISMISSED"]),
            deliveredAt: z.string().optional(),
            timestamp: z.string(),
        })
    )
    .handler(async ({ data }) => {
        return await api.post<Message>("/notification/push-event", data);
    });
