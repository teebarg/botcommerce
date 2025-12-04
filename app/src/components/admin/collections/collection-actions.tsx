import React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Pencil, Trash2 } from "lucide-react";

import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { Collection } from "@/schemas/product";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { useDeleteCollection } from "@/hooks/useCollection";

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
        <div className="relative flex items-center">
            <Overlay
                open={editState.isOpen}
                title="Edit Collection"
                trigger={
                    <Button size="icon" variant="ghost">
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CollectionForm collection={collection} type="update" onClose={editState.close} />
            </Overlay>
            <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                    </Button>
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
