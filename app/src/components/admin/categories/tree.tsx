import React, { useEffect, useState } from "react";
import { FileImage, Plus, Save } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import CategoryAction from "./categories-control";
import CategoryImageManager from "./category-image";
import { CategoryForm } from "./category-form";
import type { Category } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReorderCategories } from "@/hooks/useCategories";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

interface Props {
    data?: Category[];
    isPending: boolean
}

const CategoryImage: React.FC<{ image: string | undefined; categoryId: number }> = ({ image, categoryId }) => {
    const stateState = useOverlayTriggerState({});

    return (
        <ConfirmDrawer
            open={stateState.isOpen}
            onOpenChange={stateState.setOpen}
            onClose={stateState.close}
            trigger={
                <div className="relative w-16 h-16 overflow-hidden rounded-xl">
                    <img alt={image || "placeholder"} className="cursor-pointer w-full h-full object-cover" src={image || "/placeholder.jpg"} />
                </div>
            }
            content={<CategoryImageManager categoryId={categoryId} initialImage={image} onClose={stateState.close} />}
            title="Update Category Image"
            hideActionBtn
        />
    );
};

const CategoryTree: React.FC<Props> = ({ data, isPending }) => {
    const addState = useOverlayTriggerState({});
    const reorderCategories = useReorderCategories();
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>(data || []);

    useEffect(() => {
        setCategories(data || []);
    }, [data]);

    const moveCategory = (categoryId: number, direction: string) => {
        const currentIndex = categories?.findIndex((cat) => cat.id === categoryId);
        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= categories?.length) return;

        const newCategories = [...categories];

        [newCategories[currentIndex], newCategories[newIndex]] = [newCategories[newIndex], newCategories[currentIndex]];

        newCategories.forEach((category: Category, index: number) => {
            category.display_order = index + 1;
        });

        setCategories(newCategories);
        setHasChanges(true);
    };

    const saveOrder = () => {
        const orderData = categories.map((category: Category) => ({
            id: category.id,
            display_order: category.display_order,
        }));

        reorderCategories.mutateAsync(orderData).then(() => {
            setHasChanges(false);
        });
    };

    return (
        <React.Fragment>
            <div className="w-full max-w-5xl mx-auto p-2 space-y-6">
                <div className="bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-lg font-semibold">Product Categories</h1>
                            <p className="text-muted-foreground mb-2 text-sm">Organize and manage your product catalog with ease</p>
                            <Badge variant="accent">{isPending ? "..." : categories?.length || 0} Categories</Badge>
                        </div>
                        <SheetDrawer
                            open={addState.isOpen}
                            title="Create Category"
                            trigger={
                                <Button className="bg-white text-gray-900 px-6 py-2 rounded-xl font-semibold hover:bg-blue-50 shadow-lg" size="lg">
                                    <Plus className="w-5 h-5" />
                                    Add New Category
                                </Button>
                            }
                            onOpenChange={addState.setOpen}
                        >
                            <CategoryForm type="create" onClose={addState.close} />
                        </SheetDrawer>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="sticky top-16 z-10 bg-background space-y-2">
                        {hasChanges && (
                            <div className="flex items-center justify-between gap-4 bg-warning-subtle border border-warning/20 rounded-xl px-4 py-2.5">
                                <p className="text-xs text-warning-subtle-foreground">
                                    You have unsaved order changes
                                </p>
                                <Button
                                    size="sm"
                                    disabled={reorderCategories.isPending}
                                    onClick={saveOrder}
                                    className="gap-1.5 shrink-0"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {reorderCategories.isPending ? "Saving…" : "Save order"}
                                </Button>
                            </div>
                        )}
                    </div>
                    {isPending ? (
                        <PageLoader variant="list" />
                    ) : categories.length == 0 ? (
                        <EmptyState
                            title="No categories yet"
                            description="Start organizing your products by creating your first category."
                            icon={FileImage}
                        />
                    ) : categories.map((category: Category, idx: number) => (
                        <div
                            key={idx}
                            className="bg-card flex items-center gap-4 py-4 px-2 rounded-xl"
                        >
                            <CategoryImage categoryId={category.id} image={category.image} />
                            <div className="flex-1 min-w-0 flex justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold truncate">{category.name}</h3>
                                    <Badge variant={category.is_active ? "success" : "destructive"}>
                                        {category.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <CategoryAction
                                    categoriesLength={categories?.length}
                                    category={category}
                                    index={idx}
                                    onOrderChange={moveCategory}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export default CategoryTree;
