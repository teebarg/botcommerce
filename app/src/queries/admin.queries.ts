import { queryOptions } from "@tanstack/react-query";
import { PaginatedAbandonedCarts, PaginatedActivities, PaginatedChats, PaginatedCoupons } from "@/schemas";
import { api } from "@/utils/api";

export interface UsersParams {
    query?: string;
    role?: "ADMIN" | "CUSTOMER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING";
    sort?: string;
}

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
    queryFn: () => api.get<AbandonedCartStats>(`/cart/abandoned-carts/stats?hours_threshold=${hours_threshold}`),
});

export const abandonedCartsQuery = (params: { search?: string; hours_threshold?: string }) => ({
    queryKey: ["abandoned-carts", JSON.stringify(params)],
    queryFn: () => api.get<PaginatedAbandonedCarts>("/cart/abandoned-carts", { params }),
});

export const chatsQuery = (params: { user_id?: number; status?: any }) =>
    queryOptions({
        queryKey: ["chats", JSON.stringify(params)],
        queryFn: () => api.get<PaginatedChats>("/chat/", { params }),
        staleTime: 1000 * 60 * 60,
    });
