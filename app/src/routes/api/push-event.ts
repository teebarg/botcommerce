import { createFileRoute } from "@tanstack/react-router";
import { Message } from "@/schemas";
import { api } from "@/utils/api";

export const Route = createFileRoute("/api/push-event")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const data = await request.json();
                console.log("🚀 ~ data:", data)
                const result = await api.post<Message>("/analytics/event", data);
                return Response.json(result);
            },
        },
    },
});
