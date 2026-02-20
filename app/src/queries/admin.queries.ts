import { queryOptions } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { StatsTrends } from "@/types/models";
import { getUsersFn } from "@/server/users.server";
import { getCouponsFn } from "@/server/coupon.server";
import { getActivitiesFn } from "@/server/activities.server";
import { getAbandonedCartsFn, getAbandonedCartStatsFn } from "@/server/abandoned-cart.server";

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

export interface CouponParams {
    query?: string;
    isActive?: boolean;
}

export const couponsQuery = (params: UsersParams) => ({
    queryKey: ["coupons", params],
    queryFn: () => getCouponsFn({ data: params }),
});

export const activitiesQuery = () => ({
    queryKey: ["activities"],
    queryFn: () => getActivitiesFn(),
});

export const abandonedCartStatsQuery = (hours_threshold: string) => ({
    queryKey: ["abandoned-carts", "stats", JSON.stringify({ hours_threshold })],
    queryFn: () => getAbandonedCartStatsFn({ data: hours_threshold }),
});

export const abandonedCartsQuery = (params: { search?: string; hours_threshold?: string }) => ({
    queryKey: ["abandoned-carts", JSON.stringify(params)],
    queryFn: () => getAbandonedCartsFn({ data: params }),
});
