import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Coupon } from "@/schemas";
import { api } from "@/utils/api";

type CreateCouponData = {
    code: string;
    discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
    discount_value: number;
    min_cart_value?: number | null;
    min_item_quantity?: number | null;
    valid_from: string;
    valid_until: string;
    max_uses: number;
    max_uses_per_user: number;
    is_active: boolean;
};

type UpdateCouponInput = {
    id: number;
    data: Partial<CreateCouponData>;
};

export const useCreateCoupon = () => {
    return useMutation({
        mutationFn: async (data: CreateCouponData) => await api.post<Coupon>("/coupon/", data),
        onError: (error: any) => {
            toast.error("Failed to create coupon: " + (error?.message || "Unknown error"));
        },
    });
};

export const useUpdateCoupon = () => {
    return useMutation({
        mutationFn: async ({ id, data }: UpdateCouponInput) => await api.patch<Coupon>(`/coupon/${id}`, data),
        onSuccess: () => {
            toast.success("Coupon updated successfully");
        },
        onError: (error: any) => {
            toast.error("Failed to update coupon: " + (error?.message || "Unknown error"));
        },
    });
};

export const useDeleteCoupon = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<void>(`/coupon/${id}`),
        onSuccess: () => {
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

            toast.error(message, { duration: 5000 });
            throw error;
        },
    });
};

export const useRemoveCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post<void>("/coupon/remove"),
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
    return useMutation({
        mutationFn: async (id: number) => await api.patch<Coupon>(`/coupon/${id}/toggle-status`),
        onError: (error: any) => {
            toast.error("Failed to toggle coupon status: " + (error?.message || "Unknown error"));
        },
    });
};

export const useAssignCoupon = () => {
    return useMutation({
        mutationFn: async ({ id, userIds }: { id: number; userIds: number[] }) => await api.post<void>(`/coupon/${id}/assign`, userIds),
        onError: (error: any) => {
            toast.error("Failed to update coupon: " + (error?.message || "Unknown error"));
        },
    });
};

interface CouponAnalytics {
    total_coupons: number;
    used_coupons: number;
    total_redemptions: number;
    active_coupons: number;
    avg_redemption_rate: number;
    date_range: {
        start_date: string;
        end_date: string;
    };
}

export const useCouponsAnalytics = () => {
    return useQuery({
        queryKey: ["coupons", "analytics"],
        queryFn: async () => api.get<CouponAnalytics>("/coupon/analytics"),
    });
};
