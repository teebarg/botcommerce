"use client";

import React from "react";

import { SharedCard } from "./shared-card";

import { useSharedCollections } from "@/lib/hooks/useCollection";
import ComponentLoader from "@/components/component-loader";
// import ServerError from "@/components/generic/server-error";
import { Shared } from "@/schemas";

export default function SharedCollectionList() {
    const { data, isLoading } = useSharedCollections();

    if (isLoading) return <ComponentLoader className="h-[400px]" />;

    return (
        <div>
            {data?.shared?.length === 0 ? (
                <div>No shared collections found.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {data?.shared?.map((col: Shared, idx: number) => <SharedCard key={idx} collection={col} />)}
                </div>
            )}
        </div>
    );
}
