import { queryOptions } from "@tanstack/react-query";
import { getUsersFn } from "@/server/users.server";
import { CartStatus, PaginatedAbandonedCarts, PaginatedActivities, PaginatedChats, PaginatedCoupons } from "@/schemas";
import { clientApi } from "@/utils/api.client";
import { StatsTrends } from "@/types/models";
import { api } from "@/utils/api";

export const statsTrendsQuery = () =>
    queryOptions({
        queryKey: ["stats", "trends"],
        queryFn: () => clientApi.get<StatsTrends>("/stats/trends"),
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

export const couponsQuery = (params: CouponParams) => ({
    queryKey: ["coupons", params],
    queryFn: () =>
        api.get<PaginatedCoupons>("/coupon/", {
            params: {
                query: params?.query || "",
                is_active: params?.isActive,
            },
        }),
});

export const activitiesQuery = () => ({
    queryKey: ["activities"],
    queryFn: () => api.get<PaginatedActivities>("/activities/"),
});

interface AbandonedCartStats {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    potential_revenue: number;
}

export const abandonedCartStatsQuery = (hours_threshold: string) => ({
    queryKey: ["abandoned-carts", "stats", JSON.stringify({ hours_threshold })],
    queryFn: () => clientApi.get<AbandonedCartStats>(`/cart/abandoned-carts/stats?hours_threshold=${hours_threshold}`),
});

export const abandonedCartsQuery = (params: { search?: string; hours_threshold?: string }) => ({
    queryKey: ["abandoned-carts", JSON.stringify(params)],
    queryFn: () => clientApi.get<PaginatedAbandonedCarts>("/cart/abandoned-carts", { params }),
});

export const chatsQuery = (params: { user_id?: number; status?: CartStatus }) =>
    queryOptions({
        queryKey: ["chats", JSON.stringify(params)],
        queryFn: () => clientApi.get<PaginatedChats>("/chat/", { params }),
        staleTime: 1000 * 60 * 60,
    });
