import { Metadata } from "next";
import { CollectionTemplate } from "@modules/collections/templates";
import { SortOptions } from "types/global";
import { Suspense } from "react";

import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";

type Props = {
    searchParams: {
        page?: number;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
};

export const revalidate = 3;

export async function generateMetadata(): Promise<Metadata> {
    const metadata = {
        title: `Collections | Botcommerce Store`,
        description: "Collections",
    } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const { sortBy, page } = searchParams;

    return (
        <Suspense fallback={<CollectionTemplateSkeleton />}>
            <CollectionTemplate page={page} searchParams={searchParams} sortBy={sortBy} />
        </Suspense>
    );
}
