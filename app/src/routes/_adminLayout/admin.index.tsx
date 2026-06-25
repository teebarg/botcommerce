import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { statsTrendsQuery } from "@/queries/admin.queries";
import { useQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/_adminLayout/admin/")({
    loader: async ({ context: { queryClient } }) => {
        queryClient.prefetchQuery(ordersQuery({ take: 5 }))
        queryClient.prefetchQuery(statsTrendsQuery())
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: paginatedOrders, isLoading } = useQuery(ordersQuery({ take: 5 }));
    const { data: statsTrends, isPending } = useQuery(statsTrendsQuery());

    return (
        <div className="px-2.5 max-w-7xl space-y-2 slide-in">
            <StatComponent summary={statsTrends?.summary} isPending={isPending} />
            <RecentOrdersList orders={paginatedOrders?.items || []} isLoading={isLoading} />
        </div>
    );
}
