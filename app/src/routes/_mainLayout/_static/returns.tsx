import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/returns")({
    head: () => ({
        meta: [
            { name: "description", content: "Returns & Exchanges Policy" },
            { title: "Returns & Exchanges" },
        ],
    }),
});
