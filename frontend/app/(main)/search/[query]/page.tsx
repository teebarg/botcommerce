import { Metadata } from "next";
import { CollectionTemplate } from "@modules/collections/templates";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Category, SortOptions } from "types/global";
import { Suspense } from "react";

import { CollectionsSideBar } from "@/modules/collections/templates/sidebar";
import { getCategories, getCollectionsList } from "@/lib/data";
import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";

export const metadata: Metadata = {
    title: "Search",
    description: "Explore all of our products.",
};

type Params = {
    params: { query: string };
    searchParams: {
        sortBy?: SortOptions;
        page?: number;
    };
};

export default async function SearchResults({ params, searchParams }: Params) {
    const { query } = params;
    const { sortBy, page } = searchParams;

    const { collections } = await getCollectionsList();

    const { categories: cat } = await getCategories();
    const categories = cat?.filter((cat: Category) => !cat.parent_id);

    return (
        <div className="max-w-7xl mx-auto mt-4">
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
                    <div className="hidden md:block">
                        <CollectionsSideBar categories={categories} collections={collections} />
                    </div>
                    <div className="w-full flex-1 flex-col">
                        <Suspense fallback={<CollectionTemplateSkeleton />}>
                            <CollectionTemplate page={page} query={query} searchParams={searchParams} sortBy={sortBy} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
