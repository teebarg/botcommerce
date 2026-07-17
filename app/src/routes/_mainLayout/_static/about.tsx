import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/about")({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "About Us",
            },
            {
                title: "About Us",
            },
        ],
    }),
});
