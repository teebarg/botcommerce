import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Coupon } from "@/schemas";

export const useCoupons = (query?: string, isActive?: boolean, skip?: number, limit?: number) => {
    return useQuery({
        queryKey: ["coupons", query, isActive, skip, limit],
        queryFn: async () =>
            await api.get<{ coupons: Coupon[]; skip: number; limit: number; total_count: number; total_pages: number }>("/coupon/", {
                params: { query: query || "", is_active: isActive, skip, limit },
            }),
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            code: string;
            discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
            discount_value: number;
            min_cart_value?: number | null;
            min_item_quantity?: number | null;
            valid_from: string;
            valid_until: string;
            max_uses: number;
            max_uses_per_user: number;
            scope: "GENERAL" | "SPECIFIC_USERS";
            is_active: boolean;
        }) => await api.post<Coupon>("/coupon/", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: any) => {
            toast.error("Failed to create coupon: " + (error?.message || "Unknown error"));
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: {
                code?: string;
                discount_type?: "PERCENTAGE" | "FIXED_AMOUNT";
                discount_value?: number;
                min_cart_value?: number | null;
                min_item_quantity?: number | null;
                valid_from?: string;
                valid_until?: string;
                max_uses?: number;
                max_uses_per_user?: number;
                scope?: "GENERAL" | "SPECIFIC_USERS";
                is_active?: boolean;
            };
        }) => await api.patch<Coupon>(`/coupon/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Coupon updated successfully");
        },
        onError: (error: any) => {
            toast.error("Failed to update coupon: " + (error?.message || "Unknown error"));
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete(`/coupon/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Coupon deleted successfully");
        },
        onError: (error: any) => {
            toast.error("Failed to delete coupon: " + (error?.message || "Unknown error"));
        },
    });
};

export const useApplyCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (code: string) => await api.post<Coupon>("/coupon/apply", null, { params: { code } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Coupon applied successfully");
        },
        onError: (error: any) => {
            const message = error?.message || "Failed to apply coupon";

            toast.error(message);
            throw error;
        },
    });
};

export const useRemoveCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post("/coupon/remove"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Coupon removed successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to remove coupon");
        },
    });
};

export const useToggleCouponStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.patch<Coupon>(`/coupon/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: any) => {
            toast.error("Failed to toggle coupon status: " + (error?.message || "Unknown error"));
        },
    });
};

export const useAssignCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, userIds }: { id: number; userIds: number[] }) => await api.post(`/coupon/${id}/assign`, { user_ids: userIds }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: any) => {
            toast.error("Failed to update coupon: " + (error?.message || "Unknown error"));
        },
    });
};
