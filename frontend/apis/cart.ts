import { fetcher } from "./fetcher";

import { revalidate } from "@/actions/revalidate";
import { Cart, Message, Order } from "@/lib/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Cart API methods
export const cartApi = {
    async get(): Promise<Cart | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;

        try {
            const response = await fetcher<Cart>(url, { next: { tags: ["cart"] } });

            return response;
        } catch (error) {
            return { error: true, message: "An error occurred" };
        }
    },
    async create(input: Cart): Promise<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        const response = await fetcher<Cart>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async add({ product_id, quantity }: { product_id: string; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items`;
        const response = await tryCatch<Cart>(fetcher(url, { method: "POST", body: JSON.stringify({ variant_id: product_id, quantity }) }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async update({ product_id, quantity }: { product_id: string; quantity: number }): Promise<Cart | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`;

        try {
            const response = await fetcher<Cart>(url, { method: "PATCH", body: JSON.stringify({ product_id, quantity }) });

            revalidate("cart");

            return response;
        } catch (error) {
            return { message: "", error: true };
        }
    },
    async updateDetails(data: any): Promise<Cart | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update-cart-details`;

        try {
            const response = await fetcher<Cart>(url, { method: "PATCH", body: JSON.stringify(data) });

            revalidate("cart");

            return response;
        } catch (error) {
            return { message: "", error: true };
        }
    },
    async delete(product_id: string): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${product_id}`;

        try {
            await fetcher<Cart>(url, { method: "DELETE" });
            revalidate("cart");

            return { error: false, message: "Cart deleted successfully" };
        } catch (error) {
            return { error: true, message: "Deleted" };
        }
    },
    async complete(): Promise<Order | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;

        try {
            const response = await fetcher<Order>(url, { method: "POST" });

            revalidate("cart");

            return response;
        } catch (error) {
            return { message: "", error: true };
        }
    },
};
