"use client";

import { Confirm } from "@modules/common/components/confirm";
import { Modal } from "@modules/common/components/modal";
import { DeleteIcon, EditIcon, EyeIcon } from "nui-react-icons";
import React, { cloneElement, isValidElement, useState } from "react";
import { useOverlayTriggerState } from "react-stately";
import { useSnackbar } from "notistack";
import { SlideOver } from "@modules/common/components/slideover";
import { useRouter } from "next/navigation";
import { Tooltip } from "@components/ui/tooltip";

interface Props {
    item: any;
    form: React.ReactNode;
    deleteAction: (id: string) => void;
}

const Actions: React.FC<Props> = ({ item, form, deleteAction }) => {
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
            enqueueSnackbar("Error deleting product", { variant: "error" });
        }
    };

    return (
        <React.Fragment>
            <div className="relative flex items-center gap-2">
                <Tooltip content="Details">
                    <span className="text-lg text-default-500 cursor-pointer active:opacity-50">
                        {/* <EyeIcon onClick={() => navigate(`/admin/products/${item.id}`)} /> */}
                        <EyeIcon />
                    </span>
                </Tooltip>
                <Tooltip content="Edit products">
                    <span className="text-lg text-default-500 cursor-pointer active:opacity-50">
                        <EditIcon onClick={() => slideOverState.open()} />
                    </span>
                </Tooltip>
                <Tooltip color="danger" content="Delete products">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon onClick={() => onDelete(item)} />
                    </span>
                </Tooltip>
            </div>
            {/* Delete Modal */}
            {deleteModalState.isOpen && (
                <Modal onClose={deleteModalState.close}>
                    <Confirm onClose={deleteModalState.close} onConfirm={onConfirmDelete} />
                </Modal>
            )}
            {slideOverState.isOpen && (
                <SlideOver className="bg-default-100" isOpen={slideOverState.isOpen} title="Edit Product" onClose={slideOverState.close}>
                    {slideOverState.isOpen && formWithHandler}
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export { Actions };
