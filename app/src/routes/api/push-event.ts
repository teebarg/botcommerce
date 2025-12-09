import { createFileRoute } from "@tanstack/react-router";
import { pushEventFn } from "@/server/pushEvent.server";

export const Route = createFileRoute("/api/push-event")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const data = await request.json();
                const result = await pushEventFn({ data });
                return Response.json(result);
            },
        },
    },
});
