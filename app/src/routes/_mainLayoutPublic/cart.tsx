import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayoutPublic/cart")({
    head: () => ({
        meta: [
            { name: "description", content: "Cart" },
            { title: "Cart" },
        ],
    }),
});
