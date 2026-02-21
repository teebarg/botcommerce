import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { PaginatedAbandonedCarts } from "@/schemas";
import { api } from "@/utils/api.server";

interface AbandonedCartStats {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    potential_revenue: number;
}

const AbandonedCartSearchParams = z.object({
    search: z.string().optional(),
    hours_threshold: z.string().optional(),
});

export const getAbandonedCartsFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => AbandonedCartSearchParams.parse(input))
    .handler(async ({ data }) => await api.get<PaginatedAbandonedCarts>("/cart/abandoned-carts", { params: data }));

export const getAbandonedCartStatsFn = createServerFn({ method: "GET" })
    .inputValidator(z.string())
    .handler(async ({ data }) => {
        const url = `/cart/abandoned-carts/stats?hours_threshold=${data}`;
        return await api.get<AbandonedCartStats>(url);
    });
