import { Metadata } from "next";
import { search } from "@modules/search/actions";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { CollectionTemplate } from "@modules/collections/templates";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export const metadata: Metadata = {
    title: "Search",
    description: "Explore all of our products.",
};

type Params = {
    params: { query: string; countryCode: string };
    searchParams: {
        sortBy?: SortOptions;
        page?: string;
    };
};

export default async function SearchResults({ params, searchParams }: Params) {
    const { query } = params;
    const { sortBy, page } = searchParams;

    const hits = await search(query).then((data) => data);

    const ids = hits
        .map((h) => h.objectID || h.id)
        .filter((id): id is string => {
            return typeof id === "string";
        });

    return (
        <>
            <div className="flex justify-between border-b w-full py-6 items-center max-w-7xl mx-auto">
                <div className="flex flex-col items-start">
                    <p className="text-default-500">Search Results for:</p>
                    <h4>
                        {decodeURI(query)} ({ids.length})
                    </h4>
                </div>
                <LocalizedClientLink className="text-default-500 hover:text-default-800" href="/collections">
                    Clear
                </LocalizedClientLink>
            </div>
            <CollectionTemplate page={page} productsIds={ids} searchParams={searchParams} sortBy={sortBy} />
        </>
    );
}
