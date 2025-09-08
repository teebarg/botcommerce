import { Metadata } from "next";
import { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { PaginatedProductSearch } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import ServerError from "@/components/generic/server-error";
import { serverApi } from "@/apis/server-client";

export const revalidate = 60;

type SearchParams = Promise<{
    sortBy?: SortOptions;
    brand_id?: string;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
    sizes?: string;
    colors?: string;
}>;

type Props = {
    searchParams: SearchParams;
};

export async function generateMetadata(): Promise<Metadata> {
    const metadata = { title: "Collections" } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const { minPrice, maxPrice, brand_id, cat_ids, sortBy, sizes, colors } = (await searchParams) || {};

    const queryParams: any = {
        limit: 12,
        sort: sortBy ?? "created_at:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        categories: cat_ids,
        brand_id: brand_id,
        sizes: sizes,
        colors: colors,
    };

    const { data, error } = await tryCatch<PaginatedProductSearch>(serverApi.get("/product/search", { params: { skip: 0, ...queryParams } }));

    if (error) {
        return <ServerError error={error} scenario="server" stack="Collections" />;
    }

    return (
        <div className="container mx-auto py-4 px-1">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialData={data?.products} initialSearchParams={queryParams} />
            </Suspense>
        </div>
    );
}
