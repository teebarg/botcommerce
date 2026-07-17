import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/help-center")({
    head: () => ({
        meta: [{ name: "description", content: "Help Center" }, { title: "Help Center" }],
    }),
});
