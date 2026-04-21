import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { statsTrendsQuery } from "@/queries/admin.queries";
import { useQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/_adminLayout/admin/")({
    loader: async ({ context: { queryClient } }) => {
        await Promise.all([queryClient.ensureQueryData(ordersQuery({ take: 5 })), queryClient.ensureQueryData(statsTrendsQuery())]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: paginatedOrders } = useQuery(ordersQuery({ take: 5 }));
    const { data: statsTrends } = useQuery(statsTrendsQuery());

    return (
        <div className="py-2.5 space-y-3">
            <StatComponent summary={statsTrends?.summary} />
            <RecentOrdersList orders={paginatedOrders?.items || []} />
        </div>
    );
}
