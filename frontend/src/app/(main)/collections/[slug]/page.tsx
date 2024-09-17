import { Metadata } from "next";
import { notFound } from "next/navigation";
import {  getCollectionBySlug, getCollectionsList } from "@lib/data";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { CollectionTemplate } from "@modules/collections/templates";

type Props = {
    params: { slug: string };
    searchParams: {
        page?: string;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
};

export async function generateStaticParams() {
    const { collections } = await getCollectionsList();

    if (!collections) {
        return [];
    }

    const collectionHandles = collections.map((collection: any) => collection.slug);

    const staticParams = collectionHandles
        .map((slug: any) => ({
            slug,
        }))
        .flat();

    console.log(staticParams);

    return staticParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    console.log("track i")
    console.log(params.slug)
    const collection = await getCollectionBySlug(params.slug);

    if (!collection) {
        notFound();
    }

    const metadata = {
        title: `${collection.name} | TBO Store`,
        description: `${collection.name} collection`,
    } as Metadata;

    return metadata;
}

export default async function CollectionPage({ params, searchParams }: Props) {
    const { sortBy, page } = searchParams;
    console.log("track 2")
    console.log(params.slug)

    const collection = await getCollectionBySlug(params.slug).then((collection) => collection);

    if (!collection) {
        notFound();
    }

    return <CollectionTemplate collection={collection} page={page} searchParams={searchParams} sortBy={sortBy} />;
}
