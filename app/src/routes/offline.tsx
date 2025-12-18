import { createFileRoute } from "@tanstack/react-router";
import OfflinePage from "@/components/OfflinePage";

export const Route = createFileRoute("/offline")({
    component: RouteComponent,
});

function RouteComponent() {
    return <OfflinePage />;
}
