import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayoutPublic/_static/returns")({
    head: () => ({
        meta: [
            { name: "description", content: "Returns & Exchanges Policy" },
            { title: "Returns & Exchanges" },
        ],
    }),
});
