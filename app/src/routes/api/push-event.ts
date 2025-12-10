import { createFileRoute } from "@tanstack/react-router";
import { Message } from "@/schemas";
import { api } from "@/utils/fetch-api";

export const Route = createFileRoute("/api/push-event")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const data = await request.json();
                const result = await api.post<Message>("/notification/push-event", data);
                return Response.json(result);
            },
        },
    },
});
