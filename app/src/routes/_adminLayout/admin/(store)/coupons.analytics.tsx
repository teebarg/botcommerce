import UnderConstruction from "@/components/under-construction";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_adminLayout/admin/(store)/coupons/analytics")({
    component: RouteComponent,
});

function RouteComponent() {
    return <UnderConstruction />;
}
