import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/terms")({
    loader: () => {
        const lastUpdated = new Date().toLocaleDateString("en-US", { 
            month: "long", 
            year: "numeric" 
        });
        return { lastUpdated };
    },
    head: () => ({
        meta: [
            { name: "description", content: "Terms and Conditions" },
            { title: "Terms and Conditions" },
        ],
    }),
});
