"use client";

import React, { useState } from "react";
import { EllipsisHorizontal, PencilSquare, Plus, Trash } from "nui-react-icons";
import { useOverlayTriggerState } from "react-stately";
import { SlideOver } from "@modules/common/components/slideover";
import { Modal } from "@modules/common/components/modal";
import { Confirm } from "@modules/common/components/confirm";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { CategoryForm } from "./category-form";

import { cn } from "@/lib/util/cn";
import { Category } from "@/lib/models";
import { deleteCategory } from "@/actions/category";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            await deleteCategory(category.id!);
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
                    <button aria-label="add categories" onClick={openModal}>
                        <Plus />
                    </button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={editModal}>
                            <PencilSquare className="mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <button
                                aria-label="delete catrgory"
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
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                <Modal isOpen={deleteModalState.isOpen} onClose={deleteModalState.close}>
                    <Confirm onClose={deleteModalState.close} onConfirm={onConfirmDelete} />
                </Modal>
            )}
        </React.Fragment>
    );
};

export default CategoryAction;
