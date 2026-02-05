import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { ArrowDownAZ, ArrowUpAZ, Edit, Trash2 } from "lucide-react";
import type { Category } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { useDeleteCategory } from "@/hooks/useCategories";
import { cn } from "@/utils";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

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
        <div className="flex items-center flex-wrap">
            <SheetDrawer
                open={editState.isOpen}
                title={`Edit Category ${category?.name}`}
                trigger={
                    <Button size="icon" variant="ghost">
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
            </SheetDrawer>
            <Button
                className={cn("", index === 0 ? "opacity-50 cursor-not-allowed" : "")}
                disabled={index === 0}
                size="icon"
                title="Move up"
                variant="ghost"
                onClick={() => onOrderChange?.(category?.id, "up")}
            >
                <ArrowUpAZ className="h-5 w-5" />
            </Button>
            <Button
                className={cn("", index === (categoriesLength ?? 0) - 1 ? "opacity-50 cursor-not-allowed" : "")}
                disabled={index === (categoriesLength ?? 0) - 1}
                size="icon"
                title="Move down"
                variant="ghost"
                onClick={() => onOrderChange?.(category?.id, "down")}
            >
                <ArrowDownAZ className="h-5 w-5" />
            </Button>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button size="icon" variant="ghost">
                        <Trash2 className="text-red-500 h-5 w-5 cursor-pointer" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onConfirmDelete}
                title={`Delete ${category.name}`}
                confirmText="Delete"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

export default CategoryAction;
