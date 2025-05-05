"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Edit, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BrandForm } from "@/components/admin/brands/brand-form";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { Brand } from "@/types/models";
import { useInvalidate } from "@/lib/hooks/useApi";
import DrawerUI from "@/components/drawer";

interface Props {
    item: Brand;
}

const BrandActions: React.FC<Props> = ({ item }) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const invalidate = useInvalidate();

    const onConfirmDelete = async () => {
        setIsPending(true);
        const { error } = await api.brand.delete(item.id);

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }
        invalidate("brands");
        toast.success("Brand deleted successfully");
        setIsPending(false);
        deleteState.close();
    };

    return (
        <div className="relative flex items-center gap-2">
            <DrawerUI open={editState.isOpen} title="Edit Brand" trigger={<Edit className="h-5 w-5" />} onOpenChange={editState.setOpen}>
                <div className="max-w-2xl">
                    <BrandForm current={item} type="update" onClose={editState.close} />
                </div>
            </DrawerUI>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="text-red-500" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {item.name}</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete {item.name}?</p>
                    <DialogFooter className="flex flex-row items-center justify-end gap-2">
                        <Button aria-label="close" className="min-w-36" variant="outline" onClick={deleteState.close}>
                            Close
                        </Button>
                        <Button aria-label="delete" className="min-w-36" isLoading={isPending} variant="destructive" onClick={onConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { BrandActions };
