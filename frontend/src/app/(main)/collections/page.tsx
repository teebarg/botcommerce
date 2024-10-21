import { Metadata } from "next";
import { CollectionTemplate } from "@modules/collections/templates";
import { SortOptions } from "types/global";

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
        title: `Collections | TBO Store`,
        description: "Collections",
    } as Metadata;

    return metadata;
}

export default async function Collections({ searchParams }: Props) {
    const { sortBy, page } = searchParams;

    return <CollectionTemplate page={page} searchParams={searchParams} sortBy={sortBy} />;
}
