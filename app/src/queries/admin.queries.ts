import { queryOptions } from "@tanstack/react-query";
import { getStatsTrendsFn } from "@/server/admin.server";

export const statsTrendsQuery = () =>
    queryOptions({
        queryKey: ["admin", "stats", "trends"],
        queryFn: () => getStatsTrendsFn(),
        staleTime: 50_000,
    });