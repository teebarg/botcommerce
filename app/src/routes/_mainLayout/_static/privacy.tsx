import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/privacy")({
    head: () => ({
        meta: [{ name: "description", content: "Privacy Policy" }, { title: "Privacy Policy" }],
    }),
});
