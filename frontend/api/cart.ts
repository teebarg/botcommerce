import { fetcher } from "./fetcher";

import { Cart } from "@/lib/models";

// Cart API methods
export const cartApi = {
    async get(): Promise<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        const response = await fetcher<Cart>(url, { next: { tags: ["cart"] } });

        return response;
    },
    async create(input: Cart): Promise<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        const response = await fetcher<Cart>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: string, input: Cart): Promise<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${id}`;
        const response = await fetcher<Cart>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${id}`;

        await fetcher<Cart>(url, { method: "DELETE" });

        return { success: true, message: "Cart deleted successfully" };
    },
};
