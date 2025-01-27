import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollectionsList } from "@lib/data";
import { CollectionTemplate } from "@modules/collections/templates";
import { Collection, SortOptions } from "types/global";
import React, { Suspense } from "react";

import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";
import { siteConfig } from "@/lib/config";

type Props = {
    params: { slug: string };
    searchParams: {
        page?: number;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
};

export const revalidate = 6;

export async function generateStaticParams() {
    const { collections }: { collections: Collection[] } = await getCollectionsList();

    if (!collections) {
        return [];
    }

    return collections?.map((collection: Collection) => ({
        slug: String(collection.slug),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const collection = await getCollectionBySlug(params.slug);

    if (!collection) {
        notFound();
    }

    return {
        title: `${collection.name} | ${siteConfig.name} Store`,
        description: `${collection.name} collection`,
    } as Metadata;
}

export default async function CollectionPage({ params, searchParams }: Props) {
    const { sortBy, page } = searchParams;

    const collection = await getCollectionBySlug(params.slug).then((collection) => collection);

    if (!collection) {
        notFound();
    }

    return (
        <Suspense fallback={<CollectionTemplateSkeleton />}>
            <CollectionTemplate collection={collection} page={page} searchParams={searchParams} sortBy={sortBy} />
        </Suspense>
    );
}
