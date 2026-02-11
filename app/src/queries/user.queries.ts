import { queryOptions } from "@tanstack/react-query";
import { getIndexCategoriesProductsFn, getIndexProductsFn, getProductFn, getProductsFeedFn } from "@/server/product.server";
import { getCatalogFn } from "@/server/catalog.server";
import { getWishlistFn } from "@/server/users.server";
import { getOrderFn, getOrdersFn } from "@/server/order.server";
import { getUserAddressesFn } from "@/server/address.server";
import { getCollectionFn } from "@/server/collections.server";
import { getReviewsFn } from "@/server/review.server";

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

export const indexProductQuery = () =>
    queryOptions({
        queryKey: ["products", "index"],
        queryFn: () => getIndexProductsFn(),
    });

export const indexCategoriesProductsQuery = () =>
    queryOptions({
        queryKey: ["products", "home"],
        queryFn: () => getIndexCategoriesProductsFn(),
    });

export const productFeedQuery = (params: FeedParams) =>
    queryOptions({
        queryKey: ["products", "feed", JSON.stringify(params)],
        queryFn: () => getProductsFeedFn({ data: { ...params, feed_seed: Math.random() * 0.5 } }),
    });

export const catalogFeedQuery = (params: CatalogFeedParams) =>
    queryOptions({
        queryKey: ["products", "catalog", JSON.stringify(params)],
        queryFn: () => getCatalogFn({ data: params }),
    });

export const wishlistQuery = (from: string) =>
    queryOptions({
        queryKey: ["products", "wishlist"],
        queryFn: () => getWishlistFn({ data: from }),
    });

export const productQuery = (slug: string) =>
    queryOptions({
        queryKey: ["products", "product", slug],
        queryFn: () => getProductFn({ data: slug }),
    });

export const orderQuery = (orderNumber: string) =>
    queryOptions({
        queryKey: ["order", orderNumber],
        queryFn: () => getOrderFn({ data: orderNumber }),
    });

export const ordersQuery = (params: { take?: number; skip?: number; status?: any; start_date?: string; end_date?: string }) =>
    queryOptions({
        queryKey: ["orders", JSON.stringify(params)],
        queryFn: () => getOrdersFn({ data: params }),
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

type ReviewsParams = {
    product_id?: number;
    skip?: number;
    sort?: string;
};

export const reviewsQuery = (params: ReviewsParams) =>
    queryOptions({
        queryKey: ["reviews", JSON.stringify(params)],
        queryFn: () => getReviewsFn({ data: params }),
    });
