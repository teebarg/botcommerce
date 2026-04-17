import { createFileRoute } from "@tanstack/react-router";
import { Message } from "@/schemas";
import { api } from "@/utils/api.server";

export const Route = createFileRoute("/api/push-event")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const data = await request.json();
                if (!data.subscriberId || !data.notificationId) {
                    return Response.json({ message: "Missing required fields: subscriberId, notificationId" }, { status: 400 });
                }
                const result = await api.post<Message>("/notification/push-event", data);
                return Response.json(result);
            },
        },
    },
});
