import { Metadata } from "next";
import { CollectionTemplate } from "@modules/collections/templates";
import { SortOptions } from "types/global";
import { Suspense } from "react";

import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";
import { siteConfig } from "@/lib/config";

type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    cat_ids?: string;
}>;

type Props = {
    searchParams: SearchParams;
};

export const revalidate = 3;

export async function generateMetadata(): Promise<Metadata> {
    const metadata = {
        title: `Collections | ${siteConfig.name} Store`,
        description: siteConfig.description,
    } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const sP = await searchParams;
    const { sortBy, page } = sP;

    return (
        <Suspense fallback={<CollectionTemplateSkeleton />}>
            <CollectionTemplate page={page} searchParams={sP} sortBy={sortBy} />
        </Suspense>
    );
}
