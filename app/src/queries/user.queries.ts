import { queryOptions } from "@tanstack/react-query";
import { getProductFn, getProductsFeedFn } from "@/server/product.server";
import { getMeFn } from "@/server/users.server";
import { getCollectionFn } from "@/server/store.server";
import { FeedQuery } from "@/schemas";

export const meQuery = () =>
    queryOptions({
        queryKey: ["user", "me"],
        queryFn: () => getMeFn(),
    });

export const productFeedQuery = (params: FeedQuery) =>
    queryOptions({
        queryKey: ["products", "list", params],
        queryFn: () => getProductsFeedFn({ data: params }),
    });

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
