import { queryOptions } from "@tanstack/react-query";
import { getProductFn, getProductsFeedFn } from "@/server/product.server";
import { getMeFn, getMeTrxnFn } from "@/server/users.server";
import { getCollectionFn, getOrderFn } from "@/server/store.server";
import { getCatalogFn, getUserAddressesFn } from "@/server/store.server";
import { api } from "@/utils/api";
import { FeedQuery, PaginatedOrders, PaginatedReview } from "@/schemas";

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

export const meTxnsQuery = (userId: string | null) =>
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

export const catalogFeedQuery = (params: CatalogFeedParams) =>
    queryOptions({
        queryKey: ["catalog", params.slug],
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
        queryFn: () => getOrderFn({ data: orderNumber }),
    });

export const ordersQuery = (params?: { take?: number; status?: any; start_date?: string; end_date?: string }) =>
    queryOptions({
        queryKey: ["orders", JSON.stringify(params)],
        queryFn: () => api.get<PaginatedOrders>("/order/", { params }),
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnMount: false,
    });

export const userAddressesQuery = (userId: string | null) =>
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

export const reviewsQuery = (params?: { search?: string; product_id?: number; sort?: string }) =>
    queryOptions({
        queryKey: ["reviews", params],
        queryFn: () => api.get<PaginatedReview>("/reviews/", { params }),
        staleTime: 1000 * 60 * 60 * 24,
    });
