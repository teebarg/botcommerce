import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { SearchParams } from "@/types/global";
import { PaginatedProduct, Product, User, Wishlist } from "@/lib/models";

// Product API methods
export const userApi = {
    async me(): Promise<User> {
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`;
            const response = await fetcher<User>(url);
            return response;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            return null as unknown as User;
        }
    },
    async wishlist(): Promise<Wishlist> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
        const response = await fetcher<Wishlist>(url, { next: { tags: ["beaf"] } });

        return response;
    },
    async addWishlist(product_id: number): Promise<Product> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
        const response = await fetcher<Product>(url, { method: "POST", body: JSON.stringify({ product_id }) });

        return response;
    },
    async deleteWishlist(id: number): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist/${id}`;
        const res = await fetcher<Product>(url, { method: "DELETE" });

        return { success: true, message: "Wishlist deleted successfully" };
    },
    async search(searchParams: SearchParams): Promise<PaginatedProduct> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { ...searchParams });
        const response = await fetcher<PaginatedProduct>(url);

        return response;
    },
    async get(slug: string): Promise<Product> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${slug}`;
        const response = await fetcher<Product>(url);

        return response;
    },
    async create(input: Product): Promise<Product> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`;
        const response = await fetcher<Product>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: string, input: Product): Promise<Product> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${id}`;
        const response = await fetcher<Product>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${id}`;
        await fetcher<Product>(url, { method: "DELETE" });

        return { success: true, message: "Product deleted successfully" };
    },
};
