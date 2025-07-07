import { Metadata } from "next";
import { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { api } from "@/apis/client";
import { PaginatedProductSearch } from "@/schemas";

type SearchParams = Promise<{
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
    const { minPrice, maxPrice, brand_id, cat_ids, sortBy } = (await searchParams) || {};

    const queryParams: any = {
        limit: 12,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        categories: cat_ids,
        brand_id: brand_id,
    };

    const initialData = await api.get<PaginatedProductSearch>("/product/search", { params: { page: 1, ...queryParams } });

    return (
        <div className="container mx-auto py-4 px-1">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialData={initialData.products} initialSearchParams={queryParams} />
            </Suspense>
        </div>
    );
}
