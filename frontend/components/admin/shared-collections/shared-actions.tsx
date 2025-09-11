"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Edit, Trash2 } from "lucide-react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { SharedForm } from "./shared-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useDeleteSharedCollection } from "@/lib/hooks/useCollection";
import { Confirm } from "@/components/generic/confirm";
import { Shared } from "@/schemas/product";

interface Props {
    item: Shared;
}

const SharedActions: React.FC<Props> = ({ item }) => {
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const router = useRouter();

    const deleteMutation = useDeleteSharedCollection();

    const onConfirmDelete = async () => {
        deleteMutation.mutateAsync(item.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="relative flex items-center justify-end gap-2 mt-4">
            <Button variant="indigo" size="icon" onClick={() => router.push(`/shared/${item.slug}`)}>
                <Eye className="h-5 w-5" />
            </Button>
            <Overlay
                open={editState.isOpen}
                sheetClassName="min-w-150"
                title="Edit Shared Collection"
                trigger={
                    <Button>
                        <Edit className="h-5 w-5 mr-1" />
                        Edit
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <SharedForm current={item} onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="h-5 w-5 mr-1" />
                        Delete
                    </Button>
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
