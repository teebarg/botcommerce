"use client";

import { Edit } from "nui-react-icons";
import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { Collection } from "@/types/models";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";

interface Props {
    collection: Collection;
    deleteAction: (id: number) => void;
}

const CollectionActions: React.FC<Props> = ({ collection, deleteAction }) => {
    const editState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const router = useRouter();

    const onConfirmDelete = async () => {
        try {
            await deleteAction(collection.id);
            router.refresh();
            toast.success(`Deleted ${collection.name}`);
            state.close();
        } catch (error) {
            toast.error(`Error deleting ${collection.name}`);
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                title="Edit Collection"
                trigger={
                    <Button size="iconOnly">
                        <Edit className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CollectionForm collection={collection} type="update" onClose={editState.close} />
            </Overlay>
            <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                <DialogTrigger>
                    <Trash2 className="h-5 w-5 text-danger" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="sr-only">Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={state.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { CollectionActions };
