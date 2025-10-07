"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Pencil, Trash2 } from "lucide-react";

import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { Collection } from "@/schemas/product";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { useDeleteCollection } from "@/lib/hooks/useCollection";

interface Props {
    collection: Collection;
}

const CollectionActions: React.FC<Props> = ({ collection }) => {
    const editState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});

    const deleteCollection = useDeleteCollection();

    const onConfirmDelete = async () => {
        deleteCollection.mutateAsync(collection.id).then(() => {
            state.close();
        });
    };

    return (
        <div className="relative flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                title="Edit Collection"
                trigger={
                    <Button size="iconOnly">
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CollectionForm collection={collection} type="update" onClose={editState.close} />
            </Overlay>
            <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                <DialogTrigger>
                    <Trash2 className="h-5 w-5 text-destructive cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={state.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { CollectionActions };
