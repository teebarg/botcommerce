import { createFileRoute } from "@tanstack/react-router";
import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ordersQueryOptions } from "@/hooks/useOrder";
import { getStatsTrendsFn } from "@/server/admin.server";

const useStatsTrends = () =>
  queryOptions({
    queryKey: ["stats-trends"],
    queryFn: () => getStatsTrendsFn(),
  })

export const Route = createFileRoute("/admin/")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useStatsTrends());
        await context.queryClient.ensureQueryData(ordersQueryOptions({ take: 5 }));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const statsTrendsQuery = useSuspenseQuery(useStatsTrends());
    const ordersQuery = useSuspenseQuery(ordersQueryOptions({ take: 5 }));
    return (
        <div>
            <StatComponent summary={statsTrendsQuery.data?.summary} />
            <RecentOrdersList orders={ordersQuery.data?.orders} />
        </div>
    );
}
