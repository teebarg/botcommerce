import { fetcher } from "./fetcher";

import { buildUrl, handleError } from "@/lib/util/util";
import { Message, PaginatedProduct, PaginatedReview, Product, Review } from "@/lib/models";
import { revalidate } from "@/actions/revalidate";

interface SearchParams {
    query?: string;
    categories?: string;
    collections?: string;
    min_price?: number | string;
    max_price?: number | string;
    page?: number;
    limit?: number;
    sort?: string;
}

// Product API methods
export const productApi = {
    async search(searchParams: SearchParams): Promise<PaginatedProduct> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { ...searchParams });

        try {
            const response = await fetcher<PaginatedProduct>(url, { next: { tags: ["product"] } });

            return response;
        } catch (error) {
            return { products: [], facets: {}, page: 1, limit: 10, total_count: 0, total_pages: 0 };
        }
    },
    async get(slug: string): Promise<Product | null> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${slug}`;

        try {
            const response = await fetcher<Product>(url, { next: { tags: ["product"] } });

            return response;
        } catch (error) {
            return null;
        }
    },
    async create(input: Product): Promise<Product | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`;

        try {
            const response = await fetcher<Product>(url, { method: "POST", body: JSON.stringify(input) });

            revalidate("product");

            return response;
        } catch (error) {
            return handleError(error);
        }
    },
    async update(id: string, input: Product): Promise<Product | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${id}`;

        try {
            const response = await fetcher<Product>(url, { method: "PATCH", body: JSON.stringify(input) });

            revalidate("product");

            return response;
        } catch (error) {
            return handleError(error);
        }
    },
    async delete(id: string): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${id}`;

        try {
            await fetcher<Product>(url, { method: "DELETE" });

            revalidate("product");

            return { error: false, message: "Product deleted successfully" };
        } catch (error) {
            return handleError(error);
        }
    },
    async reviews({ product_id, page = 1, limit = 20 }: { product_id?: number; page: number; limit: number }): Promise<PaginatedReview> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`, { product_id, page, limit });
        const response = await fetcher<PaginatedReview>(url);

        return response;
    },
    async addReview(input: { product_id: number; rating: number; comment: string }): Promise<Review | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`;

        try {
            const res = await fetcher<Review>(url, { method: "POST", body: JSON.stringify(input) });

            revalidate("product");

            return res;
        } catch (error) {
            return handleError(error);
        }
    },
    async export(): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/export`;

        try {
            await fetcher<Review>(url, { method: "GET" });

            return { error: false, message: "Export Successful" };
        } catch (error) {
            return handleError(error);
        }
    },
    async uploadImage({ id, formData }: { id: string; formData: FormData }): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${id}/image`;

        try {
            await fetcher<Review>(url, { method: "PATCH", body: formData }, true);

            revalidate("product");

            return { error: false, message: "Image upload successful" };
        } catch (error) {
            return handleError(error);
        }
    },
    async bulkUpload(formData: FormData): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/upload-products/`;

        try {
            await fetcher<Review>(url, { method: "POST", body: formData }, true);

            revalidate("product");

            return { error: false, message: "Upload successful" };
        } catch (error) {
            return handleError(error);
        }
    },
    async reIndex(): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/reindex`;

        try {
            await fetcher<{ message: string }>(url, { method: "POST" });

            revalidate("product");

            return { error: false, message: "Products indexed successfully" };
        } catch (error) {
            return handleError(error);
        }
    },
};
