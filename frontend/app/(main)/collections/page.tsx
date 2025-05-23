import { Metadata } from "next";
import { SortOptions, WishItem } from "types/models";
import { Suspense } from "react";

import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { api } from "@/apis";
import { auth } from "@/actions/auth";
import ServerError from "@/components/generic/server-error";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import NoProductsFound from "@/components/store/products/no-products";

type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    brand_id?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

type Props = {
    searchParams: SearchParams;
};

export async function generateMetadata(): Promise<Metadata> {
    const metadata = { title: "Collections" } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const { minPrice, maxPrice, brand_id, cat_ids, page, sortBy } = (await searchParams) || {};
    const user = await auth();

    let wishlist: WishItem[] = [];

    if (user) {
        const { data } = await api.user.wishlist();

        wishlist = data ? data.wishlists : [];
    }

    const queryParams: any = {
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
        <div className="container mx-auto py-4 px-1">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient data={data} initialSearchParams={queryParams} user={user} wishlist={wishlist} />
            </Suspense>
        </div>
    );
}
