import { queryOptions } from "@tanstack/react-query";
import { getProductFn, getProductsFeedFn } from "@/server/product.server";
import { getMeFn, getMeTrxnFn } from "@/server/users.server";
import { getCollectionFn } from "@/server/store.server";
import { getUserAddressesFn } from "@/server/store.server";
import { FeedQuery } from "@/schemas";

type CatalogFeedParams = {
    slug: string;
    sizes?: string;
    colors?: string;
    width?: number;
    length?: number;
};

export const meQuery = () =>
    queryOptions({
        queryKey: ["user", "me"],
        queryFn: () => getMeFn(),
    });

export const meTxnsQuery = (userId: number | null) =>
    queryOptions({
        queryKey: ["wallet", userId?.toString()],
        queryFn: () => getMeTrxnFn(),
        enabled: Boolean(userId)
    });

export const productFeedQuery = (params: FeedQuery) =>
    queryOptions({
        queryKey: ["products", "list", params],
        queryFn: () => getProductsFeedFn({ data: params }),
    });

export const productQuery = (slug: string) =>
    queryOptions({
        queryKey: ["product", "slug", slug],
        queryFn: () => getProductFn({ data: slug }),
    });

export const userAddressesQuery = (userId: number | null) =>
    queryOptions({
        queryKey: ["addresses", userId?.toString()],
        queryFn: () => getUserAddressesFn(),
        enabled: Boolean(userId),
    });

export const collectionQuery = (slug: string) =>
    queryOptions({
        queryKey: ["collection", slug],
        queryFn: () => getCollectionFn({ data: slug }),
    });
