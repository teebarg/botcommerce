import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Category } from "@/schemas";
import { api } from "@/utils/fetch-api";
import type { Coupon } from "@/schemas";

// --- Type Definitions for API Response Schemas ---
interface PaginatedCouponsResponse {
    coupons: Coupon[];
    skip: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

// This structure matches the response for useCouponsAnalytics
interface CouponAnalyticsResponse {
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

const GetCouponsParamsSchema = z
    .object({
        query: z.string().optional(),
        isActive: z.boolean().optional(),
        skip: z.number().optional(),
        limit: z.number().optional(),
    })
    .optional();

// Schema for creating a coupon
const CreateCouponSchema = z.object({
    code: z.string(),
    discount_type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discount_value: z.number(),
    min_cart_value: z.number().nullable().optional(),
    min_item_quantity: z.number().nullable().optional(),
    valid_from: z.string(),
    valid_until: z.string(),
    max_uses: z.number(),
    max_uses_per_user: z.number(),
    scope: z.enum(["GENERAL", "SPECIFIC_USERS"]),
    is_active: z.boolean(),
});

// Schema for updating a coupon (all fields optional, but includes ID)
const UpdateCouponPayloadSchema = z.object({
    id: z.number(),
    data: CreateCouponSchema.partial(),
});

// Schema for assigning coupons to users
const AssignCouponSchema = z.object({
    id: z.number(),
    userIds: z.array(z.number()),
});

// --- Server Functions ---
export const getCouponsFn = createServerFn({ method: "GET" })
    .inputValidator(GetCouponsParamsSchema)
    .handler(async ({ data }) => {
        const params = {
            query: data?.query || "",
            is_active: data?.isActive,
            skip: data?.skip,
            limit: data?.limit,
        };
        return await api.get<PaginatedCouponsResponse>("/coupon/", { params });
    });

export const createCouponFn = createServerFn({ method: "POST" })
    .inputValidator(CreateCouponSchema)
    .handler(async ({ data }) => {
        return await api.post<Coupon>("/coupon/", data);
    });

export const updateCouponFn = createServerFn({ method: "POST" })
    .inputValidator(UpdateCouponPayloadSchema)
    .handler(async ({ data }) => {
        return await api.patch<Coupon>(`/coupon/${data.id}`, data.data);
    });

export const deleteCouponFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<void>(`/coupon/${id}`);
    });

export const applyCouponFn = createServerFn({ method: "POST" })
    .inputValidator(z.string())
    .handler(async ({ data: code }) => {
        return await api.post<Coupon>("/coupon/apply", null, { params: { code } });
    });

export const removeCouponFn = createServerFn({ method: "POST" }).handler(async () => {
    return await api.post<void>("/coupon/remove");
});


export const toggleCouponStatusFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.patch<Coupon>(`/coupon/${id}/toggle-status`);
    });


export const assignCouponFn = createServerFn({ method: "POST" })
    .inputValidator(AssignCouponSchema)
    .handler(async ({ data }) => {
        return await api.post<void>(`/coupon/${data.id}/assign`, data.userIds);
    });

export const getCouponsAnalyticsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<CouponAnalyticsResponse>("/coupon/analytics");
});
