"use client";

import { Confirm } from "@modules/common/components/confirm";
import { Modal } from "@modules/common/components/modal";
import { Delete, Edit, Eye } from "nui-react-icons";
import React, { cloneElement, isValidElement, useState } from "react";
import { useOverlayTriggerState } from "react-stately";
import { useRouter } from "next/navigation";
import { Tooltip } from "@components/ui/tooltip";
import { toast } from "sonner";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface Props {
    label?: string;
    item: any;
    form: React.ReactNode;
    showDetails?: boolean;
    deleteAction: (id: string) => void;
}

const Actions: React.FC<Props> = ({ label, item, form, showDetails = true, deleteAction }) => {
    const [current, setCurrent] = useState<any>({ is_active: true });
    const deleteModalState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const formWithHandler = isValidElement(form) ? cloneElement(form as React.ReactElement, { onClose: state.close }) : form;
    const router = useRouter();

    const onDelete = (value: any) => {
        setCurrent((prev: any) => ({ ...prev, ...value }));
        deleteModalState.open();
    };

    const onConfirmDelete = async () => {
        try {
            await deleteAction(current.id);
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
                            <DrawerTitle className="sr-only">Address</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-6">{formWithHandler}</div>
                    </DrawerContent>
                </Drawer>
                <Tooltip color="danger" content={`Delete ${label}`}>
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <Delete onClick={() => onDelete(item)} />
                    </span>
                </Tooltip>
            </div>
            {/* Delete Modal */}
            {deleteModalState.isOpen && (
                <Modal isOpen={deleteModalState.isOpen} onClose={deleteModalState.close}>
                    <Confirm onClose={deleteModalState.close} onConfirm={onConfirmDelete} />
                </Modal>
            )}
        </React.Fragment>
    );
};

export { Actions };
