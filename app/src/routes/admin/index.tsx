import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { recentOrdersQuery, statsTrendsQuery } from "@/queries/admin.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/")({
    loader: async ({ context: { queryClient } }) => {
        await Promise.all([queryClient.ensureQueryData(recentOrdersQuery()), queryClient.ensureQueryData(statsTrendsQuery())]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: paginatedOrders } = useSuspenseQuery(recentOrdersQuery());
    const { data: statsTrends } = useSuspenseQuery(statsTrendsQuery());

    return (
        <div>
            <StatComponent summary={statsTrends.summary} />
            <RecentOrdersList orders={paginatedOrders.orders} />
        </div>
    );
}
