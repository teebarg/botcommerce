"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Edit, Trash2 } from "lucide-react";

import { Category } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/categories/category-form";
import Overlay from "@/components/overlay";
import { useDeleteCategory } from "@/lib/hooks/useCategories";
import { Confirm } from "@/components/generic/confirm";

interface Props {
    category?: Category;
}

const CategoryAction: React.FC<Props> = ({ category }) => {
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const deleteMutation = useDeleteCategory();

    const onConfirmDelete = async () => {
        if (!category) {
            return;
        }
        deleteMutation.mutateAsync(category.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                title={`Edit Category ${category?.name}`}
                trigger={
                    <Button size="iconOnly">
                        <Edit className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <CategoryForm
                    hasParent={!!category?.parent_id}
                    current={category}
                    parent_id={category?.parent_id}
                    type="update"
                    onClose={editState.close}
                />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="text-rose-500 h-5 w-5 cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="bg-content1">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete Category</DialogTitle>
                    </DialogHeader>
                    <Confirm onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryAction;
