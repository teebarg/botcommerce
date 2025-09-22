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
    const { minPrice, maxPrice, cat_ids, sortBy, sizes, colors } = (await searchParams) || {};

    const queryParams: any = {
        limit: 12,
        sort: sortBy ?? "id:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        cat_ids,
        sizes,
        colors,
    };

    const { data, error } = await tryCatch<PaginatedProductSearch>(serverApi.get("/product/", { params: { skip: 0, ...queryParams } }));

    if (error) {
        return <ServerError error={error} scenario="server" stack="Collections" />;
    }

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2">
            <Suspense fallback={<CollectionTemplateSkeleton />}>
                <InfiniteScrollClient initialData={data?.products} initialSearchParams={queryParams} />
            </Suspense>
        </div>
    );
}
