"use client";

import React, { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";
import { Edit, Plus, Trash2 } from "lucide-react";

import { Category } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInvalidate } from "@/lib/hooks/useApi";
import { api } from "@/apis";
import { CategoryForm } from "@/components/admin/categories/category-form";
import Overlay from "@/components/overlay";

interface Props {
    canAdd?: boolean;
    category?: Category;
}

const CategoryAction: React.FC<Props> = ({ category, canAdd = true }) => {
    const deleteState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const invalidate = useInvalidate();
    const [isPending, setIsPending] = useState<boolean>(false);

    const onConfirmDelete = async () => {
        if (!category) {
            return;
        }
        setIsPending(true);
        const res = await api.category.delete(category.id!);

        if (res.error) {
            toast.error(res.error);
            setIsPending(false);

            return;
        }

        invalidate("categories");
        setIsPending(false);
        deleteState.close();
    };

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                {canAdd && (
                    <Overlay
                        trigger={
                            <Button size="iconOnly">
                                <Plus />
                            </Button>
                        }
                        open={state.isOpen}
                        onOpenChange={state.setOpen}
                        title={`Add SubCat to ${category?.name}`}
                    >
                        <CategoryForm hasParent parent_id={category?.id} onClose={state.close} />
                    </Overlay>
                )}
                <Overlay
                    trigger={
                        <Button size="iconOnly">
                            <Edit className="h-5 w-5" />
                        </Button>
                    }
                    open={editState.isOpen}
                    onOpenChange={editState.setOpen}
                    title={`Edit Category ${category?.name}`}
                >
                    <CategoryForm hasParent current={category} parent_id={category?.id} type="update" onClose={editState.close} />
                </Overlay>
                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger>
                        <Trash2 className="text-rose-500" />
                    </DialogTrigger>
                    <DialogContent className="bg-content1">
                        <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this category?</p>
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
        </React.Fragment>
    );
};

export default CategoryAction;
