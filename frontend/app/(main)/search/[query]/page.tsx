import { Metadata } from "next";
import { Suspense } from "react";
import { SortOptions, WishItem } from "types/models";
import { Exclamation } from "nui-react-icons";

import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";
import { auth } from "@/actions/auth";
import ServerError from "@/components/generic/server-error";
import { BtnLink } from "@/components/ui/btnLink";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";

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

    const res = await api.product.search(queryParams);

    if (res.error) {
        return <ServerError />;
    }

    if (!res.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-content1 w-full">
                <div className="max-w-md mx-auto text-center">
                    <Exclamation className="w-20 h-20 mx-auto text-danger" />
                    <h1 className="text-4xl font-bold mt-6">Oops! No Products Found</h1>
                    <p className="text-default-500 my-4">{`There are no products in this category`}</p>
                    <BtnLink color="primary" href="/">
                        Go to Home
                    </BtnLink>
                </div>
            </div>
        );
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
                    <InfiniteScrollClient data={res.data} initialSearchParams={queryParams} user={user} wishlist={wishlist} />
                </Suspense>
            </div>
        </div>
    );
}
