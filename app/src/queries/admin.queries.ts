import { queryOptions } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { StatsTrends } from "@/types/models";
import { getUsersFn } from "@/server/users.server";

export const statsTrendsQuery = () =>
    queryOptions({
        queryKey: ["admin", "stats", "trends"],
        queryFn: () => clientApi.get<StatsTrends>("/stats/trends"),
        staleTime: 50_000,
    });

export interface UsersParams {
    query?: string;
    role?: "ADMIN" | "CUSTOMER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING";
    sort?: string;
}

export const usersQuery = (params: UsersParams) =>
    queryOptions({
        queryKey: ["users", params],
        queryFn: () => getUsersFn({ data: { ...params } }),
    });
