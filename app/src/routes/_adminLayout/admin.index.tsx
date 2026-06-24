import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { statsTrendsQuery } from "@/queries/admin.queries";
import { useQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/queries/user.queries";
import AdminPageLoading from "@/components/admin/admin-loader";

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

    if (isLoading || isPending){
        return <AdminPageLoading />
    }

    return (
        <div className="py-2.5 space-y-3 slide-in">
            <StatComponent summary={statsTrends?.summary} />
            <RecentOrdersList orders={paginatedOrders?.items || []} />
        </div>
    );
}
