import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/careers")({
    head: () => ({
        meta: [{ name: "description", content: "Careers" }, { title: "Careers" }],
    }),
});
