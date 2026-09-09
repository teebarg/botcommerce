import { createFileRoute } from "@tanstack/react-router";
import { Message } from "@/schemas";
import { api } from "@/utils/api";
import { tryCatch } from "@/utils/try-catch";

export const Route = createFileRoute("/api/push-event")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const data = await request.json();
                console.log("🚀 ~ data:", data);
                const result = await tryCatch(api.post<Message>("/analytics/event", data));
                console.log("🚀 ~ result:", result);
                return Response.json(result);
            },
        },
    },
});
