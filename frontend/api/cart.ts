import { revalidate, revalidateCart } from "@/actions/revalidate";
import { fetcher } from "./fetcher";

import { Cart, Exception, Order } from "@/lib/models";

// Cart API methods
export const cartApi = {
    async get(): Promise<Cart | Exception> {
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
    async add({ product_id, quantity }: { product_id: string; quantity: number }): Promise<Cart | Exception> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/add`;
        try {
            const response = await fetcher<Cart>(url, { method: "POST", body: JSON.stringify({ product_id, quantity }) });
            revalidate("cart");
            return response;
        } catch (error) {
            return { message: "", error: true };
        }
    },
    async update({ product_id, quantity }: { product_id: string; quantity: number }): Promise<Cart | Exception> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`;
        try {
            const response = await fetcher<Cart>(url, { method: "PATCH", body: JSON.stringify({ product_id, quantity }) });
            revalidateCart();
            return response;
        } catch (error) {
            return { message: "", error: true };
        }
    },
    async updateDetails(data: any): Promise<Cart | Exception> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update-cart-details`;
        try {
            const response = await fetcher<Cart>(url, { method: "PATCH", body: JSON.stringify(data) });
            revalidateCart();
            return response;
        } catch (error) {
            return { message: "", error: true };
        }
    },
    async delete(product_id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${product_id}`;

        await fetcher<Cart>(url, { method: "DELETE" });
        revalidateCart();
        return { success: true, message: "Cart deleted successfully" };
    },
    async complete(): Promise<Order | Exception> {
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
