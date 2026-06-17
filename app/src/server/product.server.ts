import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { type ProductSearch, type ProductFeed, type ProductLite, FeedQuerySchema } from "@/schemas";

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

export const getProductsFeedFn = createServerFn()
    .inputValidator(FeedQuerySchema)
    .handler(async ({ data }) => {
        const res = await api.get<ProductFeed>("/product/feed", { params: { limit: 40, ...data } });
        return res;
    });

export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<ProductLite>(`/product/${data}`);
        return res;
    });
