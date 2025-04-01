"use client";

import { PencilSquare } from "nui-react-icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "nui-react-icons";
import { toast } from "sonner";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BrandForm } from "@/modules/admin/brands/brand-form";
import { Button } from "@/components/ui/button";

interface Props {
    item: any;
    deleteAction: (id: number) => void;
}

const Actions: React.FC<Props> = ({ item, deleteAction }) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const router = useRouter();

    const onConfirmDelete = async () => {
        try {
            setIsPending(true);
            await deleteAction(item.id);
            router.refresh();
            deleteState.close();
        } catch (error) {
            toast.error("Error deleting brand");
            setIsPending(false);
        }
    };

    return (
        <React.Fragment>
            <div className="relative flex items-center gap-2">
                <Drawer open={editState.isOpen} onOpenChange={editState.setOpen}>
                    <DrawerTrigger>
                        <PencilSquare />
                    </DrawerTrigger>
                    <DrawerContent className="px-8">
                        <DrawerHeader>
                            <DrawerTitle>Edit {item.name}</DrawerTitle>
                        </DrawerHeader>
                        <div className="max-w-2xl">
                            <BrandForm current={item} type="update" onClose={editState.close} />
                        </div>
                    </DrawerContent>
                </Drawer>
                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger>
                        <Trash className="text-red-500" />
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete {item.name}</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete {item.name}?</p>
                        <DialogFooter>
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
        </React.Fragment>
    );
};

export { Actions };
