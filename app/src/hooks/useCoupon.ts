import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    applyCouponFn,
    assignCouponFn,
    createCouponFn,
    deleteCouponFn,
    getCouponsAnalyticsFn,
    removeCouponFn,
    toggleCouponStatusFn,
    updateCouponFn,
} from "@/server/coupon.server";

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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateCouponData) => {
            return await createCouponFn({ data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Coupon created successfully");
        },
        onError: (error: any) => {
            toast.error("Failed to create coupon: " + (error?.message || "Unknown error"));
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: UpdateCouponInput) => await updateCouponFn({ data: { id, data } }),
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
        mutationFn: async (id: number) => await deleteCouponFn({ data: id }),
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
        mutationFn: async (code: string) => await applyCouponFn({ data: code }),
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
        mutationFn: async () => await removeCouponFn({}),
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
        mutationFn: async (id: number) => await toggleCouponStatusFn({ data: id }),
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
        mutationFn: async ({ id, userIds }: { id: number; userIds: number[] }) => await assignCouponFn({ data: { id, userIds } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: any) => {
            toast.error("Failed to update coupon: " + (error?.message || "Unknown error"));
        },
    });
};

// type CouponAnalyticsResponse = {
//     total_coupons: number;
//     used_coupons: number;
//     total_redemptions: number;
//     active_coupons: number;
//     avg_redemption_rate: number;
//     date_range: {
//         start_date: string;
//         end_date: string;
//     };
// };

export const useCouponsAnalytics = () => {
    return useQuery({
        queryKey: ["coupons"],
        queryFn: async () => getCouponsAnalyticsFn(),
        // select: (data) => data as CouponAnalyticsResponse,
    });
};
