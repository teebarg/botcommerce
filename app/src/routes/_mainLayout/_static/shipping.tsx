import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/shipping")({
    head: () => ({
        meta: [{ name: "description", content: "Shipping Information" }, { title: "Shipping Information" }],
    }),
});
