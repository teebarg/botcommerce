import { fetcher } from "./fetcher";

import { revalidate } from "@/actions/revalidate";
import { Cart, Message, Order } from "@/lib/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Cart API methods
export const cartApi = {
    async get(): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        return await tryCatch<Cart>(fetcher(url, { next: { tags: ["cart"] } }));
    },
    async create(input: Cart): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        const response = await tryCatch<Cart>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("cart");
        }

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
    async update({ product_id, quantity }: { product_id: string; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`;

        const response = await tryCatch<Cart>(fetcher(url, { method: "PATCH", body: JSON.stringify({ product_id, quantity }) }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async updateDetails(data: any): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update-cart-details`;
        const response = await tryCatch<Cart>(fetcher(url, { method: "PATCH", body: JSON.stringify(data) }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async delete(product_id: string): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${product_id}`;

        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async complete(): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;
        const response = await tryCatch<Order>(fetcher(url, { method: "POST" }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
};
