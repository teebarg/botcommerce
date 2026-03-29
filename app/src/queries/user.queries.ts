import { queryOptions } from "@tanstack/react-query";
import { getProductFn, getProductsFeedFn } from "@/server/product.server";
import { getMeFn, getMeTrxnFn } from "@/server/users.server";
import { getCollectionFn } from "@/server/store.server";
import { getCatalogFn, getUserAddressesFn } from "@/server/store.server";
import { clientApi } from "@/utils/api.client";
import { Order, PaginatedOrders, PaginatedReview } from "@/schemas";

type FeedParams = {
    search?: string;
    categories?: string;
    collections?: string;
    min_price?: number;
    max_price?: number;
    width?: number;
    length?: number;
    sort?: string;
    show_facets?: boolean;
};

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

export const meTxnsQuery = () =>
    queryOptions({
        queryKey: ["wallet"],
        queryFn: () => getMeTrxnFn(),
    });

export const productFeedQuery = (params: FeedParams) =>
    queryOptions({
        queryKey: ["products", "list", params],
        queryFn: () => getProductsFeedFn({ data: { ...params, feed_seed: Math.random() * 0.5 } }),
    });

export const catalogFeedQuery = (params: CatalogFeedParams) =>
    queryOptions({
        queryKey: ["products", "catalog", JSON.stringify(params)],
        queryFn: () => getCatalogFn({ data: params }),
    });

export const productQuery = (slug: string) =>
    queryOptions({
        queryKey: ["product", "slug", slug],
        queryFn: () => getProductFn({ data: slug }),
    });

export const orderQuery = (orderNumber: string) =>
    queryOptions({
        queryKey: ["order", orderNumber],
        queryFn: () => clientApi.get<Order>(`/order/${orderNumber}`),
    });

export const ordersQuery = (params: { take?: number; status?: any; start_date?: string; end_date?: string }) =>
    queryOptions({
        queryKey: ["orders", JSON.stringify(params)],
        queryFn: () => clientApi.get<PaginatedOrders>("/order/", { params }),
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnMount: false,
    });

export const userAddressesQuery = () =>
    queryOptions({
        queryKey: ["addresses"],
        queryFn: () => getUserAddressesFn(),
    });

export const collectionQuery = (slug: string) =>
    queryOptions({
        queryKey: ["collection", slug],
        queryFn: () => getCollectionFn({ data: slug }),
    });

export const reviewsQuery = (params?: { search?: string; product_id?: number; sort?: string }) =>
    queryOptions({
        queryKey: ["reviews", params],
        queryFn: () => clientApi.get<PaginatedReview>("/reviews/", { params }),
        staleTime: 1000 * 60 * 60 * 24,
    });
