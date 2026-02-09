import { createFileRoute } from "@tanstack/react-router";
// import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
// import { getStatsTrendsFn } from "@/server/admin.server";
// import { getOrdersFn } from "@/server/order.server";
import { api } from "@/utils/fetch-api";
import { StatsTrends } from "@/types/models";

export const Route = createFileRoute("/admin/")({
    loader: async () => {
        console.log("server?", typeof window === "undefined");
        // const paginatedOrders = await getOrdersFn({ data: { take: 5 } });
        // const statsTrends = await getStatsTrendsFn();
        const statsTrends = await api.get<StatsTrends>("/stats/trends", { from: "/admin" });
        console.log("🚀 ~ file: index.tsx:13 ~ statsTrends:", statsTrends);
        return {
            paginatedOrders: [],
            statsTrends,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { paginatedOrders, statsTrends } = Route.useLoaderData();
    console.log("🚀 ~ file: index.tsx:25 ~ paginatedOrders:", paginatedOrders)
    console.log("🚀 ~ file: index.tsx:25 ~ statsTrends:", statsTrends);
    return (
        <div>
            <StatComponent summary={statsTrends?.summary} />
            {/* <RecentOrdersList orders={paginatedOrders?.orders} /> */}
        </div>
    );
}
