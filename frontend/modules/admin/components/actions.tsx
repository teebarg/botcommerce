"use client";

import { Confirm } from "@modules/common/components/confirm";
import { Modal } from "@modules/common/components/modal";
import { Delete, EditIcon, Eye } from "nui-react-icons";
import React, { cloneElement, isValidElement, useState } from "react";
import { useOverlayTriggerState } from "react-stately";
import { useSnackbar } from "notistack";
import { SlideOver } from "@modules/common/components/slideover";
import { useRouter } from "next/navigation";
import { Tooltip } from "@components/ui/tooltip";

interface Props {
    label?: string;
    item: any;
    form: React.ReactNode;
    showDetails?: boolean;
    deleteAction: (id: string) => void;
}

const Actions: React.FC<Props> = ({ label, item, form, showDetails = true, deleteAction }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [current, setCurrent] = useState<any>({ is_active: true });
    const deleteModalState = useOverlayTriggerState({});
    const slideOverState = useOverlayTriggerState({});
    const formWithHandler = isValidElement(form) ? cloneElement(form as React.ReactElement, { onClose: slideOverState.close }) : form;
    const router = useRouter();

    const onDelete = (value: any) => {
        setCurrent((prev: any) => ({ ...prev, ...value }));
        deleteModalState.open();
    };

    const onConfirmDelete = async () => {
        try {
            await deleteAction(current.id);
            router.refresh();
        } catch (error) {
            enqueueSnackbar(`Error deleting ${label}`, { variant: "error" });
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
                <Tooltip content={`Edit ${label}`}>
                    <span className="text-lg text-default-500 cursor-pointer active:opacity-50">
                        <EditIcon onClick={() => slideOverState.open()} />
                    </span>
                </Tooltip>
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
            {slideOverState.isOpen && (
                <SlideOver className="bg-default-100" isOpen={slideOverState.isOpen} title={`Edit ${label}`} onClose={slideOverState.close}>
                    {slideOverState.isOpen && formWithHandler}
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export { Actions };
