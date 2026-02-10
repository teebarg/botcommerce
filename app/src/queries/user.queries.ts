import { queryOptions } from "@tanstack/react-query";
import { getProductsFeedFn } from "@/server/product.server";
import { getCatalogFn } from "@/server/catalog.server";

type FeedParams = {
    search?: string;
    categories?: string;
    collections?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    show_facets?: boolean;
};

type CatalogFeedParams = {
    slug: string;
    sizes?: number;
    colors?: string;
};

export const productFeedQuery = (params: FeedParams) =>
    queryOptions({
        queryKey: ["products", "feed", JSON.stringify(params)],
        queryFn: () => getProductsFeedFn({ data: { ...params, feed_seed: Math.random() } }),
        staleTime: 5_000,
    });


export const catalogFeedQuery = (params: CatalogFeedParams) =>
    queryOptions({
        queryKey: ["products", "catalog", "feed", JSON.stringify(params)],
        queryFn: () => getCatalogFn({ data: params }),
        staleTime: 5_000,
    });
