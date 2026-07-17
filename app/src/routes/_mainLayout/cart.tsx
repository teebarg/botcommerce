import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/cart")({
    head: () => ({
        meta: [
            { name: "description", content: "Cart" },
            { title: "Cart" },
        ],
    }),
});
