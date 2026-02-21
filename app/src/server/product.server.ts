import { api } from "@/utils/api.server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Product, ProductSearch, ProductFeed } from "@/schemas";
import { CategoriesWithProducts } from "./categories.server";

const ProductIdSchema = z.number();
const ProductLimitSchema = z.number().default(20);

export const SearchSchema = z.object({
    search: z.string().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
    show_facets: z.boolean().optional(),
    show_suggestions: z.boolean().optional(),
    cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    collections: z.string().optional(),
});

export const FeedQuerySchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
    show_facets: z.boolean().optional(),
    show_suggestions: z.boolean().optional(),
    cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    collections: z.string().optional(),
    feed_seed: z.number().optional(),
    cursor: z.string().optional(),
});

export const RelatedProductSearchSchema = z.object({
    productId: z.number().optional(),
    limit: z.number().optional(),
});

interface IndexProducts {
    arrival: ProductSearch[];
    featured: ProductSearch[];
    trending: ProductSearch[];
}

export const getIndexProductsFn = createServerFn().handler(async () => await api.get<IndexProducts>("/product/index-products"));
export const getIndexCategoriesProductsFn = createServerFn().handler(async () => await api.get<CategoriesWithProducts[]>("/category/home/products"));

export const getProductsFeedFn = createServerFn()
    .inputValidator(FeedQuerySchema)
    .handler(async ({ data }) => {
        const res = await api.get<ProductFeed>("/product/feed", { params: { limit: 40, ...data } });
        return res;
    });

export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<Product>(`/product/${data}`);
        return res;
    });

export const recommendedProductsFn = createServerFn({ method: "GET" })
    .inputValidator(z.object({ limit: ProductLimitSchema }))
    .handler(async ({ data: { limit } }) => {
        return await api.get<{ recommended: ProductSearch[] }>("/product/recommend", { params: { limit } });
    });

export const similarProductsFn = createServerFn({ method: "GET" })
    .inputValidator(z.object({ productId: ProductIdSchema, limit: ProductLimitSchema }))
    .handler(async ({ data: { productId, limit } }) => {
        return await api.get<{ similar: ProductSearch[] }>(`/product/${productId}/similar`, { params: { limit } });
    });
