import { Metadata } from "next";
import { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import LocalizedClientLink from "@/components/ui/link";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { PaginatedProductSearch } from "@/schemas";
import { serverApi } from "@/apis/server-client";
import { tryCatch } from "@/lib/try-catch";
import ServerError from "@/components/generic/server-error";

export const metadata: Metadata = {
    title: "Search",
};

type Params = Promise<{ query: string }>;
type SearchParams = Promise<{
    sortBy?: SortOptions;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
}>;

export default async function SearchResults({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { query } = await params;
    const { minPrice, maxPrice, cat_ids, sortBy } = (await searchParams) || {};

    const queryParams: any = {
        search: query,
        limit: 24,
        sort: sortBy ?? "id:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        cat_ids,
    };

    const { data: initialData, error } = await tryCatch<PaginatedProductSearch>(serverApi.get("/product/", { params: { skip: 0, ...queryParams } }));

    if (error) {
        return <ServerError error={error} scenario="server" stack="SearchResults" />;
    }

    return (
        <div className="container mx-auto mt-4 py-4 px-1">
            <div className="flex justify-between border-b border-divider w-full items-center px-4 mb-4">
                <div className="flex flex-col items-start">
                    <p className="text-muted-foreground">Search Results for:</p>
                    <h4>{decodeURI(query)}</h4>
                </div>
                <LocalizedClientLink className="text-muted-foreground hover:text-foreground" href="/collections">
                    Clear
                </LocalizedClientLink>
            </div>
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialData={initialData?.products} initialSearchParams={queryParams} />
            </Suspense>
        </div>
    );
}
