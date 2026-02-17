import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { Cart } from "@/schemas";
import { api } from "@/utils/fetch-api";

interface AbandonedCartStats {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    potential_revenue: number;
}

interface AbandonedCart {
    carts: Cart[];
    skip: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

const AbandonedCartSearchParams = z.object({
    search: z.string().optional(),
    hours_threshold: z.number().optional(),
    skip: z.number().optional(),
});

export const getAbandonedCartsFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => AbandonedCartSearchParams.parse(input))
    .handler(async ({ data }) => await api.get<AbandonedCart>("/cart/abandoned-carts", { params: data }));

export const getAbandonedCartStatsFn = createServerFn({ method: "GET" })
    .inputValidator(z.number())
    .handler(async ({ data }) => {
        const url = `/cart/abandoned-carts/stats?hours_threshold=${data}`;
        return await api.get<AbandonedCartStats>(url);
    });
