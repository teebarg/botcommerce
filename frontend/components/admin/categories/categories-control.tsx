"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { ArrowDownAZ, ArrowUpAZ, Edit, Trash2 } from "lucide-react";

import { Category } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/categories/category-form";
import Overlay from "@/components/overlay";
import { useDeleteCategory } from "@/lib/hooks/useCategories";
import { Confirm } from "@/components/generic/confirm";
import { cn } from "@/lib/utils";

interface Props {
    category: Category;
    index?: number;
    categoriesLength?: number;
    onOrderChange?: (id: number, direction: "up" | "down") => void;
}

const CategoryAction: React.FC<Props> = ({ category, index, categoriesLength, onOrderChange }) => {
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
                    current={category}
                    hasParent={!!category?.parent_id}
                    parent_id={category?.parent_id}
                    type="update"
                    onClose={editState.close}
                />
            </Overlay>
            <Button
                className={cn("", index === 0 ? "opacity-50 cursor-not-allowed" : "")}
                disabled={index === 0}
                size="iconOnly"
                title="Move up"
                onClick={() => onOrderChange?.(category?.id, "up")}
            >
                <ArrowUpAZ className="h-5 w-5" />
            </Button>
            <Button
                className={cn("", index === (categoriesLength ?? 0) - 1 ? "opacity-50 cursor-not-allowed" : "")}
                disabled={index === (categoriesLength ?? 0) - 1}
                size="iconOnly"
                title="Move down"
                onClick={() => onOrderChange?.(category?.id, "down")}
            >
                <ArrowDownAZ className="h-5 w-5" />
            </Button>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="text-rose-500 h-5 w-5 cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete Category</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryAction;
