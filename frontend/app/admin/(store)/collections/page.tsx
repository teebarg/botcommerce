import { Metadata } from "next";
import React from "react";

import { api } from "@/apis";
import ServerError from "@/components/generic/server-error";
import ClientOnly from "@/components/generic/client-only";
import CollectionView from "@/components/admin/collections/collection-view";

export const metadata: Metadata = {
    title: "Collections",
};

type SearchParams = Promise<{ search?: string }>;

export default async function CollectionsPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    const search = searchParams.search || "";
    const { data: collections, error } = await api.collection.getAll(search);

    if (error || !collections) {
        return <ServerError />;
    }

    const deleteCollection = async (id: number) => {
        "use server";
        await api.collection.delete(id);
    };

    return (
        <ClientOnly>
            <CollectionView collections={collections} deleteAction={deleteCollection} />
        </ClientOnly>
    );
}
