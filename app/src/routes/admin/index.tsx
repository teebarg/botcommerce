import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { statsTrendsQuery } from "@/queries/admin.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/admin/")({
    loader: async ({ context: { queryClient } }) => {
        await Promise.all([queryClient.ensureQueryData(ordersQuery({ take: 5 })), queryClient.ensureQueryData(statsTrendsQuery())]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: paginatedOrders } = useSuspenseQuery(ordersQuery({ take: 5 }));
    const { data: statsTrends } = useSuspenseQuery(statsTrendsQuery());

    return (
        <div>
            <StatComponent summary={statsTrends.summary} />
            <RecentOrdersList orders={paginatedOrders.items} />
        </div>
    );
}
