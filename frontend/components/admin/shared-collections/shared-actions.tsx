"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Pencil, Trash2 } from "lucide-react";

import { SharedForm } from "./shared-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useDeleteBrand } from "@/lib/hooks/useBrand";
import { Confirm } from "@/components/generic/confirm";
import { Shared } from "@/schemas/product";

interface Props {
    item: Shared;
}

const SharedActions: React.FC<Props> = ({ item }) => {
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});

    const deleteMutation = useDeleteBrand();

    const onConfirmDelete = async () => {
        deleteMutation.mutateAsync(item.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="relative flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                sheetClassName="min-w-150"
                title="Edit Shared Collection"
                trigger={
                    <Button size="iconOnly" onClick={editState.open}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <SharedForm current={item} onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete {item.title}</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { SharedActions };
