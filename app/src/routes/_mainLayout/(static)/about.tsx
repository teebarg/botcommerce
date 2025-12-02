import UnderConstruction from "@/components/under-construction";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/(static)/about")({
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
    component: RouteComponent,
});

function RouteComponent() {
    return <UnderConstruction />;
}
