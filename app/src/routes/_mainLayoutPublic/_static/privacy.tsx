import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayoutPublic/_static/privacy")({
    head: () => ({
        meta: [{ name: "description", content: "Privacy Policy" }, { title: "Privacy Policy" }],
    }),
});
