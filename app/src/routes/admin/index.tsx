import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { getStatsTrendsFn } from "@/server/admin.server";
import { getOrdersFn } from "@/server/order.server";

export const Route = createFileRoute("/admin/")({
    loader: async () => {
        const paginatedOrders = await getOrdersFn({ data: { take: 5 } });
        const statsTrends = await getStatsTrendsFn();
        return {
            paginatedOrders,
            statsTrends,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { paginatedOrders, statsTrends } = Route.useLoaderData();
    return (
        <div>   
            <StatComponent summary={statsTrends?.summary} />
            <RecentOrdersList orders={paginatedOrders?.orders} />
        </div>
    );
}
