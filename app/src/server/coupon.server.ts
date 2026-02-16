import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/utils/fetch-api";
import type { Coupon } from "@/schemas";

interface PaginatedCoupons {
    coupons: Coupon[];
    skip: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

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

const GetCouponsParamsSchema = z
    .object({
        query: z.string().optional(),
        isActive: z.boolean().optional(),
        skip: z.number().optional(),
    })
    .optional();

export const getCouponsFn = createServerFn({ method: "GET" })
    .inputValidator(GetCouponsParamsSchema)
    .handler(async ({ data }) => {
        const params = {
            query: data?.query || "",
            is_active: data?.isActive,
            skip: data?.skip,
        };
        return await api.get<PaginatedCoupons>("/coupon/", { params });
    });

export const getCouponsAnalyticsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<CouponAnalytics>("/coupon/analytics");
});
