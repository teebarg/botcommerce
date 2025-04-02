"use client";

import { Confirm } from "@modules/common/components/confirm";
import { Delete, Edit, Eye } from "nui-react-icons";
import React, { cloneElement, isValidElement } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";
import { Tooltip } from "@components/ui/tooltip";
import { toast } from "sonner";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
    label?: string;
    item: any;
    form: React.ReactNode;
    showDetails?: boolean;
    deleteAction: (id: string) => void;
}

const Actions: React.FC<Props> = ({ label, item, form, showDetails = true, deleteAction }) => {
    const deleteModalState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const formWithHandler = isValidElement(form) ? cloneElement(form as React.ReactElement, { onClose: state.close }) : form;
    const router = useRouter();

    const onConfirmDelete = async () => {
        try {
            await deleteAction(item.id);
            router.refresh();
            toast.success(`Deleted ${label}`);
            deleteModalState.close();
        } catch (error) {
            toast.error(`Error deleting ${label}`);
        }
    };

    return (
        <React.Fragment>
            <div className="relative flex items-center gap-2">
                {showDetails && (
                    <Tooltip content="Details">
                        <span className="text-lg text-default-500 cursor-pointer active:opacity-50">
                            <Eye />
                        </span>
                    </Tooltip>
                )}
                <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                    <DrawerTrigger>
                        <Edit onClick={() => state.open()} />
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="sr-only">Edit</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-6">{formWithHandler}</div>
                    </DrawerContent>
                </Drawer>
                <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                    <DialogTrigger>
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                            <Delete />
                        </span>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="sr-only">Delete</DialogTitle>
                        </DialogHeader>
                        <Confirm onClose={deleteModalState.close} onConfirm={onConfirmDelete} />
                    </DialogContent>
                </Dialog>
            </div>
        </React.Fragment>
    );
};

export { Actions };
