"use client";

import { Confirm } from "@modules/common/components/confirm";
import { Edit } from "nui-react-icons";
import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DrawerUI from "@/components/drawer";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { Collection } from "@/types/models";

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
            <DrawerUI open={editState.isOpen} title="Edit Collection" trigger={<Edit className="h-5 w-5" />} onOpenChange={editState.setOpen}>
                <div className="max-w-2xl">
                    <CollectionForm collection={collection} type="update" onClose={editState.close} />
                </div>
            </DrawerUI>
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
