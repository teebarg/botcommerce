"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { SharedCard } from "./shared-card";
import { SharedForm } from "./shared-form";

import ComponentLoader from "@/components/component-loader";
import { DBCatalog } from "@/schemas";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { useCatalogs } from "@/lib/hooks/useCollection";

export default function SharedCollectionList() {
    const state = useOverlayTriggerState({});
    const { data, isLoading } = useCatalogs();

    if (isLoading) return <ComponentLoader className="h-[400px]" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Catalogs</h1>
                <Overlay
                    open={state.isOpen}
                    sheetClassName="min-w-[450px]"
                    title="Add New Catalog"
                    trigger={
                        <Button onClick={state.open}>
                            <Plus className="w-4 h-4" />
                            Add New
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <SharedForm current={undefined} onClose={() => state.close()} />
                </Overlay>
            </div>
            {data?.shared?.length === 0 ? (
                <div>No Catalogs found.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {data?.shared?.map((col: DBCatalog, idx: number) => <SharedCard key={idx} catalog={col} />)}
                </div>
            )}
        </div>
    );
}
