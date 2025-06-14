import { fetcher } from "./fetcher";
import { api } from "./base";

import { buildUrl } from "@/lib/utils";
import { Order, OrderStatus, PaginatedOrder } from "@/schemas";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { revalidate } from "@/actions/revalidate";

// Order API methods
export const orderApi = {
    async query(input?: { search?: string; skip?: number; take?: number }): ApiResult<PaginatedOrder> {
        const searchParams = { search: input?.search || "", skip: input?.skip || 0, take: input?.take || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`, searchParams);

        return await tryCatch<PaginatedOrder>(fetcher(url, { next: { tags: ["orders"] } }));
    },
    async get(id: string): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;

        return await tryCatch<Order>(fetcher(url));
    },
    async create(input: Order): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;
        const response = await tryCatch<Order>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("orders");
        }

        return response;
    },
    async update(id: string, input: Order): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;
        const response = await tryCatch<Order>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("orders");
        }

        return response;
    },
    async status(id: number, status: OrderStatus): ApiResult<Order> {
        return await api.patch<Order>(`/order/${id}/status?status=${status}`);
    },
};
