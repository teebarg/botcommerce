import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionTemplate } from "@modules/collections/templates";
import { SortOptions } from "types/global";
import React, { Suspense } from "react";

import { CollectionTemplateSkeleton } from "@/modules/collections/skeleton";
import { siteConfig } from "@/lib/config";
import { api } from "@/api";

type Params = Promise<{ slug: string }>;
// type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type SearchParams = Promise<{
    page?: number;
    sortBy?: SortOptions;
    cat_ids?: string;
}>;

export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params;
    const collection = await api.collection.getBySlug(slug);

    if (!collection) {
        notFound();
    }

    return {
        title: `${collection.name} | ${siteConfig.name} Store`,
        description: `${collection.name} collection`,
    } as Metadata;
}

export default async function CollectionPage(props: { params: Params; searchParams: SearchParams }) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { sortBy, page } = searchParams;

    const collection = await api.collection.getBySlug(params.slug).then((collection) => collection);

    if (!collection) {
        notFound();
    }

    return (
        <Suspense fallback={<CollectionTemplateSkeleton />}>
            <CollectionTemplate collection={collection} page={page} searchParams={searchParams} sortBy={sortBy} />
        </Suspense>
    );
}
