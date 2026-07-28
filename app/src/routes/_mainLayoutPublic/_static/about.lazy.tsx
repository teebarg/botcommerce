import UnderConstruction from "@/components/under-construction";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_mainLayoutPublic/_static/about")({
    component: RouteComponent,
});

function RouteComponent() {
    return <UnderConstruction />;
}
