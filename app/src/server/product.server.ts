import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import { type ProductFeed, type ProductLite, FeedQuerySchema } from "@/schemas";

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
