import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { api } from "@/apis";
import ServerError from "@/components/generic/server-error";
import { auth } from "@/actions/auth";
import NoProductsFound from "@/components/store/products/no-products";
import { WishItem } from "@/schemas";

type Params = Promise<{ slug: string }>;

type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    brand_id?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: collection } = await api.collection.getBySlug(slug);

    if (!collection) {
        notFound();
    }

    return { title: collection.name } as Metadata;
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const user = await auth();
    const { minPrice, maxPrice, brand_id, cat_ids, page, sortBy } = (await searchParams) || {};
    const { slug } = await params;
    const { data: collection } = await api.collection.getBySlug(slug).then((collection) => collection);

    if (!collection) {
        notFound();
    }

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
        collections: collection?.slug,
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
        <div className="container mx-auto py-4 px-2">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient data={data} initialSearchParams={queryParams} user={user} wishlist={wishlist} />
            </Suspense>
        </div>
    );
}
