"use client";

import React, { useState } from "react";
import { PencilSquare, Plus, Trash } from "nui-react-icons";
import { useOverlayTriggerState } from "react-stately";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CategoryForm } from "./category-form";

import { Category } from "@/types/models";
import { deleteCategory } from "@/actions/category";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
    canAdd?: boolean;
    category?: Category;
}

const CategoryAction: React.FC<Props> = ({ category, canAdd = true }) => {
    const deleteState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const [isPending, setIsPending] = useState<boolean>(false);
    const router = useRouter();

    const onConfirmDelete = async () => {
        if (!category) {
            return;
        }
        try {
            setIsPending(true);
            await deleteCategory(category.id!);
            router.refresh();
            deleteState.close();
        } catch (error) {
            toast.error("Error deleting category");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                {canAdd && (
                    <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                        <DrawerTrigger>
                            <Plus />
                        </DrawerTrigger>
                        <DrawerContent className="px-8">
                            <DrawerHeader>
                                <DrawerTitle>Add SubCat to {category?.name}</DrawerTitle>
                            </DrawerHeader>
                            <div className="max-w-2xl">
                                <CategoryForm hasParent parent_id={category?.id} onClose={state.close} />
                            </div>
                        </DrawerContent>
                    </Drawer>
                )}
                <Drawer open={editState.isOpen} onOpenChange={editState.setOpen}>
                    <DrawerTrigger>
                        <PencilSquare />
                    </DrawerTrigger>
                    <DrawerContent className="px-8">
                        <DrawerHeader>
                            <DrawerTitle>Edit {category?.name}</DrawerTitle>
                        </DrawerHeader>
                        <div className="max-w-lg">
                            <CategoryForm hasParent current={category} parent_id={category?.id} type="update" onClose={editState.close} />
                        </div>
                    </DrawerContent>
                </Drawer>
                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger>
                        <Trash className="text-rose-500" />
                    </DialogTrigger>
                    <DialogContent className="bg-content1">
                        <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this category?</p>
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

export default CategoryAction;
