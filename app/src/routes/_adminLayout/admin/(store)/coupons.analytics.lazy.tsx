import UnderConstruction from "@/components/under-construction";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_adminLayout/admin/(store)/coupons/analytics")({
    component: RouteComponent,
});

function RouteComponent() {
    return <UnderConstruction />;
}
