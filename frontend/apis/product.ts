import { api } from "@/apis/client";

import { ApiResult, tryCatch } from "@/lib/try-catch";
import { PaginatedProductSearch } from "@/schemas/product";

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

export const productApi = {
    async search(searchParams: SearchParams): ApiResult<PaginatedProductSearch> {
        return await tryCatch<PaginatedProductSearch>(api.get("/product/search", { params: { ...searchParams } }));
    },
};
