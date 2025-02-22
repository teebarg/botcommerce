import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { SearchParams } from "@/types/global";
import { PaginatedProduct, PaginatedReview, Product } from "@/lib/models";

// Product API methods
export const productApi = {
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
    async reviews({ product_id, page = 1, limit = 20 }: { product_id?: number; page: number; limit: number }): Promise<PaginatedReview> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`, { product_id, page, limit });
        const response = await fetcher<PaginatedReview>(url);

        return response;
    },
};
