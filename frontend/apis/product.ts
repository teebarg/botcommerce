import { fetcher } from "./fetcher";
import { api } from "./base";

import { buildUrl, handleError } from "@/lib/util/util";
import { Message, PaginatedProduct, PaginatedProductSearch, PaginatedReview, Product, ProductVariant, Review } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";

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
    async all(searchParams: SearchParams): ApiResult<PaginatedProduct> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { ...searchParams });

        return await tryCatch<PaginatedProduct>(fetcher(url, { next: { tags: ["products"] } }));
    },
    async search(searchParams: SearchParams): ApiResult<PaginatedProductSearch> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search`, { ...searchParams });

        return await tryCatch<PaginatedProductSearch>(fetcher(url, { next: { tags: ["search"] } }));
    },
    async get(slug: string): ApiResult<Product> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${slug}`;

        return await tryCatch<Product>(fetcher(url, { next: { tags: ["product"] } }));
    },
    async create(input: any): ApiResult<Product> {
        return await api.post<Product>(`/product`, input);
    },
    async update(id: number, input: any): ApiResult<Product> {
        return await api.put<Product>(`/product/${id}`, input);
    },
    async delete(id: number): ApiResult<Message> {
        return await api.delete<Message>(`/product/${id}`);
    },
    async reviews({ product_id, page = 1, limit = 20 }: { product_id?: number; page: number; limit: number }): Promise<PaginatedReview> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`, { product_id, page, limit });
        const response = await fetcher<PaginatedReview>(url);

        return response;
    },
    async addReview(input: { product_id: number; rating: number; comment: string }): ApiResult<Review> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`;

        return await tryCatch<Review>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));
    },
    async productReviews({ product_id }: { product_id?: number }): ApiResult<Review[]> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${product_id}/reviews`;
        const response = await tryCatch<Review[]>(fetcher(url, { next: { tags: ["reviews"] } }));

        return response;
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
    async uploadImage({ id, data }: { id: number; data: any }): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${id}/image`;

        const response = await tryCatch<Message>(fetcher(url, { method: "PATCH", body: JSON.stringify(data) }));

        if (!response.error) {
            revalidate("products");
            revalidate("search");
        }

        return response;
    },
    async deleteImage(id: number): ApiResult<Message> {
        return await api.delete<Message>(`/product/${id}/image`);
    },
    async uploadImages({ id, data }: { id: number; data: any }): ApiResult<Message> {
        return await api.post<Message>(`/product/${id}/images`, data);
    },
    async deleteImages(id: number, imageId: number): ApiResult<Message> {
        return await api.delete<Message>(`/product/${id}/images/${imageId}`);
    },
    async bulkUpload(formData: FormData): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/upload-products/`;
        const response = await tryCatch<Message>(fetcher(url, { method: "POST", body: formData }));

        if (!response.error) {
            revalidate("products");
            revalidate("search");
        }

        return response;
    },
    async reIndex(): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/reindex`;

        try {
            await fetcher<{ message: string }>(url, { method: "POST" });

            revalidate("product");
            revalidate("search");

            return { error: false, message: "Products indexed successfully" };
        } catch (error) {
            return handleError(error);
        }
    },
    async createVariant(input: {
        productId: number;
        name: string;
        sku?: string;
        image?: string;
        price: number;
        inventory: number;
        status: "IN_STOCK" | "OUT_OF_STOCK";
    }): ApiResult<ProductVariant> {
        const { productId, ...variantData } = input;

        return await api.post<ProductVariant>(`/product/${productId}/variants`, variantData);
    },
    async updateVariant(input: {
        id: number;
        name?: string;
        slug?: string;
        price?: number;
        inventory?: number;
        status?: "IN_STOCK" | "OUT_OF_STOCK";
    }): ApiResult<ProductVariant> {
        const { id, ...variantData } = input;

        return await api.put<ProductVariant>(`/product/variants/${id}`, variantData);
    },
    async deleteVariant(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/variants/${id}`;
        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("products");
            revalidate("search");
        }

        return response;
    },
};
