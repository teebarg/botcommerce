import { Metadata } from "next";
import React from "react";

import CollectionView from "@/components/admin/collections/collection-view";

export const metadata: Metadata = {
    title: "Collections",
};

type SearchParams = Promise<{ search?: string }>;

export default async function CollectionsPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    const search = searchParams.search || "";

    return <CollectionView search={search} />;
}
