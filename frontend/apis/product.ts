import { api } from "./base";

import { ApiResult } from "@/lib/try-catch";
import { PaginatedProductSearch, Product } from "@/schemas/product";

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
        return await api.get<PaginatedProductSearch>("/product/search", { params: { ...searchParams }, cache: "default" });
    },
    async get(slug: string): ApiResult<Product> {
        return await api.get<Product>(`/product/${slug}`, { next: { tags: ["product"] } });
    },
};
