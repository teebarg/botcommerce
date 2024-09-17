import { Metadata } from "next";
import { getCollectionsList, listRegions } from "@lib/data";
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

export const PRODUCT_LIMIT = 12;

export async function generateStaticParams() {
    const { collections } = await getCollectionsList();

    if (!collections) {
        return [];
    }

    const collectionHandles = collections.map((collection: any) => collection.slug);

    const staticParams = collectionHandles
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
