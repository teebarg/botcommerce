import { Metadata } from "next";
import { Suspense } from "react";
import { SortOptions, WishItem } from "types/models";

import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";
import { auth } from "@/actions/auth";
import ServerError from "@/components/generic/server-error";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import NoProductsFound from "@/components/store/products/no-products";

export const metadata: Metadata = {
    title: "Search",
};

type Params = Promise<{ query: string }>;
type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    brand_id?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

export default async function SearchResults({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { query } = await params;
    const { minPrice, maxPrice, brand_id, cat_ids, page, sortBy } = (await searchParams) || {};
    const user = await auth();

    let wishlist: WishItem[] = [];

    if (user) {
        const { data } = await api.user.wishlist();

        wishlist = data ? data.wishlists : [];
    }

    const queryParams: any = {
        search: query,
        limit: 12,
        page: page ?? 1,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        categories: cat_ids,
        brand_id: brand_id,
    };

    const { data, error } = await api.product.search(queryParams);

    if (error) {
        return <ServerError />;
    }

    if (!data) {
        return <NoProductsFound />;
    }

    return (
        <div className="max-w-8xl mx-auto mt-4">
            <div className="flex justify-between border-b w-full items-center">
                <div className="flex flex-col items-start">
                    <p className="text-default-500">Search Results for:</p>
                    <h4>{decodeURI(query)}</h4>
                </div>
                <LocalizedClientLink className="text-default-500 hover:text-default-900" href="/collections">
                    Clear
                </LocalizedClientLink>
            </div>
            <div className="w-full py-0 md:py-4">
                <Suspense fallback={<CollectionTemplateSkeleton />}>
                    <InfiniteScrollClient data={data} initialSearchParams={queryParams} user={user} wishlist={wishlist} />
                </Suspense>
            </div>
        </div>
    );
}
