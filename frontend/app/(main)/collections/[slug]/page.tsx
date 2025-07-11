import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { api } from "@/apis/client";
import { Collection, PaginatedProductSearch } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";

type Params = Promise<{ slug: string }>;

type SearchParams = Promise<{
    sortBy?: SortOptions;
    brand_id?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const { data: collection } = await tryCatch<Collection>(api.get(`/collection/slug/${slug}`));

    if (!collection) {
        notFound();
    }

    return { title: collection.name } as Metadata;
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { minPrice, maxPrice, brand_id, cat_ids, sortBy } = (await searchParams) || {};
    const { slug } = await params;
    const { data: collection } = await tryCatch<Collection>(api.get(`/collection/slug/${slug}`));

    if (!collection) {
        notFound();
    }

    const queryParams: any = {
        limit: 12,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        collections: collection?.slug,
        categories: cat_ids,
        brand_id: brand_id,
    };

    const initialData = await api.get<PaginatedProductSearch>("/product/search", { params: { page: 1, ...queryParams } });

    return (
        <div className="container mx-auto py-4 px-2">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialData={initialData.products} initialSearchParams={queryParams} />
            </Suspense>
        </div>
    );
}
