import { Metadata } from "next";
import { getCollectionsList } from "@lib/data";
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

    const collectionSlugs = collections.map((collection: any) => collection.slug);

    const staticParams = collectionSlugs
        .map((slug: string) => ({
            slug,
        }))
        .flat();

    return staticParams;
}

export async function generateMetadata(): Promise<Metadata> {
    const metadata = {
        title: `Collections | TBO Store`,
        description: "Collections",
    } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const { sortBy, page } = searchParams;

    return <CollectionTemplate page={page} searchParams={searchParams} sortBy={sortBy} />;
}
