"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Pencil, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BrandForm } from "@/components/admin/brands/brand-form";
import { Button } from "@/components/ui/button";
import { Brand } from "@/schemas/product";
import Overlay from "@/components/overlay";
import { useDeleteBrand } from "@/lib/hooks/useBrand";
import { Confirm } from "@/components/generic/confirm";

interface Props {
    item: Brand;
}

const BrandActions: React.FC<Props> = ({ item }) => {
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
                title="Edit Brand"
                trigger={
                    <Button size="iconOnly" onClick={editState.open}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <BrandForm current={item} type="update" onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete {item.name}</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { BrandActions };
