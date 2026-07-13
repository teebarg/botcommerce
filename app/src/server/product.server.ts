import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { type ProductFeed, type ProductLite, CategoriesWithProducts, FeedQuerySchema, ProductSearch, SearchCatalog } from "@/schemas";
import { z } from "zod";
import { notFound } from "@tanstack/react-router";

interface IndexProducts {
    arrival: ProductSearch[];
    featured: ProductSearch[];
    trending: ProductSearch[];
}

export const getIndexProductsFn = createServerFn()
    .handler(async () => {
        const res = await api.get<IndexProducts>("/product/index-products");
        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=30",
                "Vercel-CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=300",
                "Vercel-Cache-Tag": "index-products,products",
            }),
        );
        return res;
    });

export const getCategoriesProductsFn = createServerFn()
    .handler(async () => {
        const res = await api.get<CategoriesWithProducts[]>("/category/home/products");
        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=30",
                "Vercel-CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=300",
                "Vercel-Cache-Tag": "categories-products,products",
            }),
        );
        return res;
    });

export const getProductFeedFn = createServerFn()
    .inputValidator(FeedQuerySchema)
    .handler(async ({ data }) => {
        const res = await api.get<ProductFeed>("/product/feed", { params: { limit: 40, ...data } });

        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=30",
                "Vercel-CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=300",
                "Vercel-Cache-Tag": "products-feed,products",
            }),
        );

        return res;
    });

export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<ProductLite>(`/product/${data}`);

        if (!res) {
            throw notFound();
        }

        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=60",
                "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
                "Vercel-Cache-Tag": `product:${data}`,
            }),
        );

        return res;
    });


export const getCatalogFeedFn = createServerFn()
    .inputValidator(z.object({
        slug: z.string().min(1, 'slug is required'),
        cursor: z.number().optional(),
    }))
    .handler(async ({ data }) => {
        const res = await api.get<SearchCatalog>(`/catalog/${data.slug}`, { params: { cursor: data.cursor } });

        setResponseHeaders(
            new Headers({
                "Cache-Control": "public, max-age=30",
                "Vercel-CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=300",
                "Vercel-Cache-Tag": "catalog-feed,products",
            }),
        );

        return res;
    });
