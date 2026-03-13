import { json } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { clerkClient } from "@clerk/tanstack-react-start/server";

export const ServerRoute = createFileRoute("/api/create-user")({
    server: {
        handlers: {
            POST: async () => {
                await clerkClient().users.createUser({
                    emailAddress: ["test@example.com"],
                    password: "changeme123",
                });

                return json({ success: true });
            },
        },
    },
});
