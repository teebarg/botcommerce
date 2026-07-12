import { getProductFeedFn, getProductFn, getCatalogFeedFn } from "@/server/product.server";
import { getMeFn } from "@/server/users.server";
import { getCollectionFn } from "@/server/store.server";
import { type InfiniteData, infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { FeedQuery, ProductFeed, SearchCatalog } from "@/schemas";

export const meQuery = () =>
    queryOptions({
        queryKey: ["user", "me"],
        queryFn: () => getMeFn(),
    });

export function normalizeFeedQuery(search?: FeedQuery) {
    return {
        search: search?.search ?? "",
        collections: search?.collections ?? null,
        cat_ids: search?.cat_ids ?? null,
        sort: search?.sort ?? "id:desc",
        min_price: search?.min_price ?? null,
        max_price: search?.max_price ?? null,
        sizes: search?.sizes ?? null,
        ages: search?.ages ?? null,
        width: search?.width ?? null,
        length: search?.length ?? null,
        cursor: search?.cursor ?? null,
    } as const;
}

export const productFeedInfiniteQuery = (search?: FeedQuery) =>
    infiniteQueryOptions<
        ProductFeed,
        Error,
        InfiniteData<ProductFeed>,
        [string, string, any],
        string | null
    >({
        queryKey: ["products", "feed", normalizeFeedQuery(search)],
        queryFn: async ({ pageParam }) => await getProductFeedFn({ data: { cursor: pageParam ?? undefined, ...search } }),
        getNextPageParam: lastPage => lastPage.next_cursor ?? null,
        initialPageParam: null,
    })

export const catalogInfiniteQuery = (slug: string) =>
    infiniteQueryOptions<
        SearchCatalog,
        Error,
        InfiniteData<SearchCatalog>,
        [string, string],
        number | null
    >({
        queryKey: ["catalog", slug],
        queryFn: async ({ pageParam }) => await getCatalogFeedFn({ data: { slug, cursor: pageParam ?? undefined } }),
        getNextPageParam: (lastPage: SearchCatalog) => lastPage.next_cursor ?? null,
        initialPageParam: null,
    })

export const productQuery = (slug: string) =>
    queryOptions({
        queryKey: ["product", slug],
        queryFn: () => getProductFn({ data: slug }),
    });

export const collectionQuery = (slug: string) =>
    queryOptions({
        queryKey: ["collection", slug],
        queryFn: () => getCollectionFn({ data: slug }),
    });
