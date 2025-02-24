import { fetcher } from "./fetcher";

import { Order } from "@/lib/models";

// Order API methods
export const orderApi = {
    async get(id: string): Promise<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;
        const response = await fetcher<Order>(url, { next: { tags: ["order"] } });

        return response;
    },
    async create(input: Order): Promise<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;
        const response = await fetcher<Order>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: string, input: Order): Promise<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;
        const response = await fetcher<Order>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;

        await fetcher<Order>(url, { method: "DELETE" });

        return { success: true, message: "Order deleted successfully" };
    },
};
