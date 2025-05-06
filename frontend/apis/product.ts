import { api } from "./base";

import { Message, PaginatedProductSearch, PaginatedReview, Product, ProductVariant, Review } from "@/types/models";
import { revalidate as revalidateAction } from "@/actions/revalidate";
import { ApiResult } from "@/lib/try-catch";

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
    async search(searchParams: SearchParams): ApiResult<PaginatedProductSearch> {
        return await api.get<PaginatedProductSearch>("/product/search", { next: { tags: ["search"] }, params: { ...searchParams } });
    },
    async get(slug: string): ApiResult<Product> {
        return await api.get<Product>(`/product/${slug}`, { next: { tags: ["product"] } });
    },
    async create(input: any): ApiResult<Product> {
        return await api.post<Product>(`/product`, input);
    },
    async update(id: number, input: any): ApiResult<Product> {
        const response = await api.put<Product>(`/product/${id}`, input);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async delete(id: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/product/${id}`);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async reviews({ product_id, page = 1, limit = 20 }: { product_id?: number; page: number; limit: number }): ApiResult<PaginatedReview> {
        return await api.get<PaginatedReview>(`/reviews/`, { next: { tags: ["product"] }, params: { product_id, page, limit } });
    },
    async addReview(input: { product_id: number; rating: number; comment: string }): ApiResult<Review> {
        return await api.post<Review>(`/reviews/`, input);
    },
    async productReviews({ product_id }: { product_id?: number }): ApiResult<Review[]> {
        return await api.get<Review[]>(`/product/${product_id}/reviews`, { next: { tags: ["reviews"] } });
    },
    async export(): ApiResult<Message> {
        return await api.post<Message>(`/product/export`, {});
    },
    async uploadImage({ id, data }: { id: number; data: any }): ApiResult<Message> {
        const response = await api.patch<Message>(`/product/${id}/image`, data);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async deleteImage(id: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/product/${id}/image`);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async uploadImages({ id, data }: { id: number; data: any }): ApiResult<Message> {
        const response = await api.post<Message>(`/product/${id}/images`, data);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async deleteImages(id: number, imageId: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/product/${id}/images/${imageId}`);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async reIndex(): ApiResult<Message> {
        const response = await api.post<Message>(`/product/reindex`);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
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
        const response = await api.delete<Message>(`/product/variants/${id}`);

        if (!response.error) {
            productApi.revalidate();
        }

        return response;
    },
    async revalidate(): Promise<void> {
        revalidateAction("product");
        revalidateAction("search");
    },
};
