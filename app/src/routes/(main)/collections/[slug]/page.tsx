import React, { Suspense } from "react";

import { SortOptions } from "@/types/models";
import InfiniteScrollClient from "@/components/store/collections/scroll-client";
import { CollectionTemplateSkeleton } from "@/components/store/collections/skeleton";
import { Collection, PaginatedProductSearch } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import ServerError from "@/components/generic/server-error";
import { serverApi } from "@/apis/server-client";
import { getSiteConfig } from "@/lib/config";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

type SearchParams = Promise<{
    sortBy?: SortOptions;
    cat_ids?: string;
    maxPrice?: string;
    minPrice?: string;
    sizes?: string;
    colors?: string;
    ages?: string;
}>;

// export async function generateMetadata({ params }: { params: Params }) {
//     const { slug } = await params;
//     const { data: collection } = await tryCatch<Collection>(serverApi.get(`/collection/${slug}`));
//     const siteConfig = await getSiteConfig();

//     return {
//         title: `${collection.name} Collection`,
//         description: `Explore ${collection.name} at ${siteConfig?.name}`,
//         openGraph: {
//             title: `${collection.name} Collection`,
//             description: `Explore ${collection.name} at ${siteConfig?.name}`,
//             url: `${import.meta.env.VITE_BASE_URL}/collections/${slug}`,
//             images: [
//                 {
//                     url: "/default-og.png",
//                     width: 1200,
//                     height: 630,
//                     alt: collection.name,
//                 },
//             ],
//         },
//         twitter: {
//             card: "summary_large_image",
//             title: `${collection.name} Collection`,
//             description: `Explore ${collection.name} at ${siteConfig?.name}`,
//             images: ["/default-og.png"],
//         },
//     };
// }

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { minPrice, maxPrice, cat_ids, sortBy, sizes, colors, ages } = (await searchParams) || {};
    const { slug } = await params;
    const { data: collection } = await tryCatch<Collection>(serverApi.get(`/collection/${slug}`));

    const queryParams: any = {
        limit: 36,
        sort: sortBy ?? "id:desc",
        max_price: maxPrice ?? 100000000,
        min_price: minPrice ?? 0,
        collections: collection?.slug,
        cat_ids,
        sizes,
        colors,
        ages,
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
