import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollectionsList } from "@lib/data";
import { CollectionTemplate } from "@modules/collections/templates";
import { Collection, SortOptions } from "types/global";

type Props = {
    params: { slug: string };
    searchParams: {
        page?: string;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
};

export const revalidate = 60

export async function generateStaticParams() {
    const { collections }: { collections: Collection[] } = await getCollectionsList();

    if (!collections) {
        return [];
    }

    return collections.map((collection: Collection) => ({
        slug: String(collection.slug),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

    const collection = await getCollectionBySlug(params.slug).then((collection) => collection);

    if (!collection) {
        notFound();
    }

    return <CollectionTemplate collection={collection} page={page} searchParams={searchParams} sortBy={sortBy} />;
}
