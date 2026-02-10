import { queryOptions } from "@tanstack/react-query";
import { getOrdersFn } from "@/server/order.server";
import { getStatsTrendsFn } from "@/server/admin.server";

export const recentOrdersQuery = () =>
    queryOptions({
        queryKey: ["admin", "orders", "recent"],
        queryFn: () => getOrdersFn({ data: { take: 5 } }),
        staleTime: 5_000, // admin data changes often
    });

export const statsTrendsQuery = () =>
    queryOptions({
        queryKey: ["admin", "stats", "trends"],
        queryFn: () => getStatsTrendsFn(),
        staleTime: 5_000,
    });