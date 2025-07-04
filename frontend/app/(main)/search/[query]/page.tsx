import { Metadata } from "next";
import { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import LocalizedClientLink from "@/components/ui/link";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { PaginatedProductSearch } from "@/schemas";
import { api } from "@/apis/client";

export const metadata: Metadata = {
    title: "Search",
};

type Params = Promise<{ query: string }>;
type SearchParams = Promise<{
    sortBy?: SortOptions;
    brand_id?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

export default async function SearchResults({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { query } = await params;
    const { minPrice, maxPrice, brand_id, cat_ids, sortBy } = (await searchParams) || {};

    const queryParams: any = {
        search: query,
        limit: 12,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        categories: cat_ids,
        brand_id: brand_id,
    };

    const initialData = await api.get<PaginatedProductSearch>("/product/search", { params: { page: 1, ...queryParams } })

    return (
        <div className="container mx-auto mt-4 py-4 px-1">
            <div className="flex justify-between border-b border-divider w-full items-center px-4 mb-4">
                <div className="flex flex-col items-start">
                    <p className="text-default-500">Search Results for:</p>
                    <h4>{decodeURI(query)}</h4>
                </div>
                <LocalizedClientLink className="text-default-500 hover:text-default-900" href="/collections">
                    Clear
                </LocalizedClientLink>
            </div>
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialSearchParams={queryParams} initialData={initialData.products} />
            </Suspense>
        </div>
    );
}
