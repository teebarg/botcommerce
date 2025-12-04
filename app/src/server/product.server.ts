import { serverApi } from "@/apis/server-client";
import { PaginatedProductSearch, Product, ProductSearch } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const SearchSchema = z.object({
    search: z.string().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
    show_facets: z.boolean().optional(),
    show_suggestions: z.boolean().optional(),
    // cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    collections: z.string().optional(),
});

export const RelatedProductSearchSchema = z.object({
    productId: z.number().optional(),
    limit: z.number().optional(),
});

export const GetProductsFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => SearchSchema.parse(input))
    .handler(async ({ data }) => {
        console.log("🚀 ~ file: product.server.ts:8 ~ data:-----", data);
        const res = await serverApi.get<PaginatedProductSearch>("/product/", { params: { skip: 0, ...data } });
        return res;
    });


export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await serverApi.get<Product>(`/product/${data}`);
        return res;
    });


export const getRelatedProductFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => RelatedProductSearchSchema.parse(input))
    .handler(async ({ data: { productId, limit = 4 } }) => {
        const res = await serverApi.get<{ similar: ProductSearch[] }>(`/product/${productId}/similar`, { params: { limit } });
        return res;
    });