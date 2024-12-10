import { Metadata } from "next";
import { search } from "@modules/search/actions";
import { CollectionTemplate } from "@modules/collections/templates";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { SortOptions } from "types/global";

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

    const hits = await search(query).then((data) => data);

    return (
        <>
            <div className="flex justify-between border-b w-full py-6 items-center max-w-7xl mx-auto">
                <div className="flex flex-col items-start">
                    <p className="text-default-500">Search Results for:</p>
                    <h4>
                        {decodeURI(query)} ({hits.length})
                    </h4>
                </div>
                <LocalizedClientLink className="text-default-500 hover:text-default-900" href="/collections">
                    Clear
                </LocalizedClientLink>
            </div>
            <CollectionTemplate page={page} query={query} searchParams={searchParams} sortBy={sortBy} />
        </>
    );
}
