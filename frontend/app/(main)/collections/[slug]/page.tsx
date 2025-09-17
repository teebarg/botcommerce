import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { Collection, PaginatedProductSearch } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import ServerError from "@/components/generic/server-error";
import { serverApi } from "@/apis/server-client";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

type SearchParams = Promise<{
    sortBy?: SortOptions;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
    sizes?: string;
    colors?: string;
}>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: collection } = await tryCatch<Collection>(serverApi.get(`/collection/${slug}`));

    if (!collection) {
        notFound();
    }

    return { title: collection.name } as Metadata;
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { minPrice, maxPrice, cat_ids, sortBy, sizes, colors } = (await searchParams) || {};
    const { slug } = await params;
    const { data: collection } = await tryCatch<Collection>(serverApi.get(`/collection/${slug}`));

    if (!collection) {
        notFound();
    }

    const queryParams: any = {
        limit: 12,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        collections: collection?.slug,
        cat_ids,
        sizes,
        colors,
    };

    const { data, error } = await tryCatch<PaginatedProductSearch>(serverApi.get("/product/", { params: { skip: 0, ...queryParams } }));

    if (error) {
        return <ServerError error={error} scenario="server" stack={`/collections/${slug}`} />;
    }

    return (
        <div className="max-w-9xl mx-auto py-4 px-2">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialData={data?.products} initialSearchParams={queryParams} />
            </Suspense>
        </div>
    );
}
