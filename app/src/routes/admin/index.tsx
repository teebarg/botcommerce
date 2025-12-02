import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";

export const Route = createFileRoute("/admin/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <StatComponent />
            <RecentOrdersList />
        </div>
    );
}
