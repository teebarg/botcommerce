import { Metadata } from "next";
import { CollectionTemplate } from "@modules/collections/templates";
import { SortOptions } from "types/global";
import { Suspense } from "react";

import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";
import LocalizedClientLink from "@/components/ui/link";

export const metadata: Metadata = {
    title: "Search",
    description: "Explore all of our products.",
};

type Params = Promise<{ query: string }>;
type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
}>;

export default async function SearchResults({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
    const { query } = await params;
    const { sortBy, page } = await searchParams;

    return (
        <div className="max-w-8xl mx-auto mt-4">
            <div className="flex justify-between border-b w-full items-center">
                <div className="flex flex-col items-start">
                    <p className="text-default-500">Search Results for:</p>
                    <h4>{decodeURI(query)}</h4>
                </div>
                <LocalizedClientLink className="text-default-500 hover:text-default-900" href="/collections">
                    Clear
                </LocalizedClientLink>
            </div>
            <div className="w-full py-0 md:py-4">
                <div className="flex gap-6 mt-0 md:mt-6">
                    <Suspense fallback={<CollectionTemplateSkeleton />}>
                        <CollectionTemplate page={page} query={query} searchParams={{ sortBy, page }} sortBy={sortBy} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
