"use client";

import React, { useState } from "react";
import { Category } from "types/global";
import { deleteCategory } from "@modules/admin/actions";
import { EllipsisHorizontal, PencilSquare, Plus, Trash } from "nui-react-icons";
import Dropdown from "@modules/common/components/dropdown";
import { useOverlayTriggerState } from "react-stately";
import { SlideOver } from "@modules/common/components/slideover";
import { Modal } from "@modules/common/components/modal";
import { Confirm } from "@modules/common/components/confirm";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { CategoryForm } from "./category-form";
import { cn } from "@/lib/util/cn";

interface Props {
    canAdd?: boolean;
    category?: Category;
}

const CategoryAction: React.FC<Props> = ({ category, canAdd = true }) => {
    const { enqueueSnackbar } = useSnackbar();
    const slideOverState = useOverlayTriggerState({});
    const deleteModalState = useOverlayTriggerState({});
    const [isNew, setIsNew] = useState<boolean>(true);
    const router = useRouter();

    const editModal = () => {
        setIsNew(false);
        slideOverState.open();
    };

    const openModal = () => {
        setIsNew(true);
        slideOverState.open();
    };

    const onConfirmDelete = async () => {
        if (!category) {
            return;
        }
        try {
            await deleteCategory(category.id);
            router.refresh();
            deleteModalState.close();
        } catch (error) {
            enqueueSnackbar("Error deleting category", { variant: "error" });
        }
    };

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                {canAdd && (
                    <button onClick={openModal}>
                        <Plus />
                    </button>
                )}
                <Dropdown align="end" trigger={<EllipsisHorizontal />}>
                    <div>
                        <div className="bg-default-100 rounded-lg shadow-md p-3 min-w-[100px] text-sm font-medium">
                            <div className="mb-2">
                                <button className="flex w-full items-center" onClick={editModal}>
                                    <span className="mr-2">
                                        <PencilSquare />
                                    </span>
                                    <span>Edit</span>
                                </button>
                            </div>
                            <div>
                                <button
                                    className={cn("flex w-full items-center text-rose-500", {
                                        "pointer-events-none select-none opacity-50": category?.children.length > 0,
                                    })}
                                    disabled={category?.children.length > 0}
                                    onClick={deleteModalState.open}
                                >
                                    <span className="mr-2">
                                        <Trash />
                                    </span>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </Dropdown>
            </div>
            {slideOverState.isOpen && (
                <SlideOver
                    className="bg-default-100"
                    isOpen={slideOverState.isOpen}
                    title={isNew ? `Add SubCat to ${category?.name}` : "Edit Category"}
                    onClose={slideOverState.close}
                >
                    {slideOverState.isOpen && (
                        <CategoryForm
                            hasParent
                            current={isNew ? undefined : category}
                            parent_id={category?.id}
                            type={isNew ? "create" : "update"}
                            onClose={slideOverState.close}
                        />
                    )}
                </SlideOver>
            )}
            {deleteModalState.isOpen && (
                <Modal onClose={deleteModalState.close}>
                    <Confirm onClose={deleteModalState.close} onConfirm={onConfirmDelete} />
                </Modal>
            )}
        </React.Fragment>
    );
};

export default CategoryAction;
