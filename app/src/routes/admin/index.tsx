import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { useStatsTrends } from "@/hooks/useApi";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useOrders } from "@/hooks/useOrder";

export const Route = createFileRoute("/admin/")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useStatsTrends());
        await context.queryClient.ensureQueryData(useOrders({ take: 5 }));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const statsTrendsQuery = useSuspenseQuery(useStatsTrends());
    const ordersQuery = useSuspenseQuery(useOrders({ take: 5 }));
    return (
        <div>
            <StatComponent summary={statsTrendsQuery.data?.summary} />
            <RecentOrdersList orders={ordersQuery.data?.orders} />
        </div>
    );
}
