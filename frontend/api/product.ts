import { z } from "zod";

import { fetcher } from "./fetcher";

import { PaginatedProductSchema, ProductSchema } from "@/lib/schema";
import { buildUrl } from "@/lib/util/util";
import { SearchParams } from "@/types/global";

type Product = z.infer<typeof ProductSchema>;
type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;

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
        const response = await fetcher<Product>(url, { method: "DELETE" });

        console.log("🚀 ~ delete ~ response:", response);

        // return response;
        return { success: true, message: "Product deleted successfully" };
    },
};
