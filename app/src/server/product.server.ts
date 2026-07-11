import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { type ProductFeed, type ProductLite, FeedQuerySchema } from "@/schemas";

export const getProductsFeedFn = createServerFn()
    .inputValidator(FeedQuerySchema)
    .handler(async ({ data }) => {
        const res = await api.get<ProductFeed>("/product/feed", { params: { limit: 40, ...data } });

        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=30",
                "Vercel-CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=300",
                "Vercel-Cache-Tag": "products-feed",
            }),
        );

        return res;
    });

export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<ProductLite>(`/product/${data}`);

        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=60",
                "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
                "Vercel-Cache-Tag": `product:${data}`,
            }),
        );

        return res;
    });
