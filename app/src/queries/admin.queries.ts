import { queryOptions } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { StatsTrends } from "@/types/models";

export const statsTrendsQuery = () =>
    queryOptions({
        queryKey: ["admin", "stats", "trends"],
        queryFn: () => clientApi.get<StatsTrends>("/stats/trends"),
        staleTime: 50_000,
    });