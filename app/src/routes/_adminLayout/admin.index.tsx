import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";

export const Route = createFileRoute("/_adminLayout/admin/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="px-2.5 max-w-7xl space-y-2 slide-in">
            <StatComponent />
            <RecentOrdersList />
        </div>
    );
}
