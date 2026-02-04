import React, { useEffect, useState } from "react";
import { ChevronDown, FileImage, Plus, Save } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import CategoryAction from "./categories-control";
import CategoryImageManager from "./category-image";
import { CategoryForm } from "./category-form";
import type { Category } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReorderCategories } from "@/hooks/useCategories";
import { ZeroState } from "@/components/zero";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface Props {
    data?: Category[];
}

const CategoryImage: React.FC<{ image: string | undefined; categoryId: number }> = ({ image, categoryId }) => {
    const stateState = useOverlayTriggerState({});

    return (
        <ConfirmDrawer
            open={stateState.isOpen}
            onOpenChange={stateState.setOpen}
            onClose={stateState.close}
            trigger={
                <div className="relative w-20 h-20 overflow-hidden rounded-xl">
                    <img alt={image || "placeholder"} className="cursor-pointer w-full h-full object-cover" src={image || "/placeholder.jpg"} />
                </div>
            }
            content={<CategoryImageManager categoryId={categoryId} initialImage={image} onClose={stateState.close} />}
            title="Update Category Image"
            hideActionBtn
        />
    );
};

const CategoryTree: React.FC<Props> = ({ data }) => {
    const addState = useOverlayTriggerState({});
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const reorderCategories = useReorderCategories();
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>(data || []);

    useEffect(() => {
        setCategories(data || []);
    }, [data]);

    const toggleCategory = (id: number) => {
        setExpandedCategories((prev: number[]) => (prev.includes(id) ? prev.filter((item: number) => item !== id) : [...prev, id]));
    };

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
            <div className="w-full max-w-6xl mx-auto p-2 md:p-4 space-y-6">
                <div className="bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Product Categories</h1>
                            <p className="text-muted-foreground text-lg">Organize and manage your product catalog with ease</p>
                            <div className="flex items-center gap-4 mt-4 text-sm">
                                <span className="bg-white/20 px-3 py-1 rounded-full">{categories?.length || 0} Categories</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full">
                                    {categories?.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)} Subcategories
                                </span>
                            </div>
                        </div>
                        <SheetDrawer
                            open={addState.isOpen}
                            title="Create Category"
                            trigger={
                                <Button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 shadow-lg" size="lg">
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

                <div className="space-y-4">
                    <div className="sticky top-16 z-10 bg-background space-y-2">
                        {hasChanges && (
                            <div className="mt-4 p-3 bg-contrast/20 border border-contrast/20 rounded-md">
                                <p className="text-sm text-contrast">
                                    {`You have unsaved changes. Click "Save Order" to apply the new category order.`}
                                </p>
                            </div>
                        )}
                        {hasChanges && (
                            <Button disabled={reorderCategories.isPending} size="lg" onClick={saveOrder}>
                                <Save size={16} />
                                <span>{reorderCategories.isPending ? "Saving..." : "Save Order"}</span>
                            </Button>
                        )}
                    </div>
                    {(categories || []).map((category: Category, idx: number) => (
                        <div
                            key={idx}
                            className="bg-card rounded-2xl shadow-sm border border-input overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="group">
                                <div className="py-4 px-2">
                                    <div className="flex items-center gap-4">
                                        <CategoryImage categoryId={category.id} image={category.image} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xl font-semibold mb-2 truncate line-clamp-1">{category.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <Badge variant={category.is_active ? "emerald" : "destructive"}>
                                                            {category.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                        {category?.subcategories && category?.subcategories?.length > 0 && (
                                                            <Badge variant="default">{category.subcategories.length} subcategories</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {category?.subcategories && category?.subcategories?.length > 0 && (
                                                        <button
                                                            aria-label={expandedCategories.includes(category.id) ? "Collapse" : "Expand"}
                                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                            onClick={() => toggleCategory(category.id)}
                                                        >
                                                            <ChevronDown
                                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                                                    expandedCategories.includes(category.id) ? "rotate-180" : ""
                                                                }`}
                                                            />
                                                        </button>
                                                    )}
                                                    <CategoryAction
                                                        categoriesLength={categories?.length}
                                                        category={category}
                                                        index={idx}
                                                        onOrderChange={moveCategory}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {category?.subcategories && category?.subcategories?.length > 0 && expandedCategories.includes(category.id) && (
                                    <div className="border-t border-input bg-card">
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {category?.subcategories?.map((subcategory, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-card rounded-xl p-4 border border-input hover:shadow-sm transition-shadow group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <CategoryImage categoryId={subcategory.id} image={subcategory.image} />

                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium truncate mb-1">{subcategory.name}</h4>
                                                                <Badge variant={subcategory.is_active ? "emerald" : "destructive"} />
                                                            </div>
                                                            <CategoryAction
                                                                categoriesLength={category?.subcategories?.length}
                                                                category={subcategory}
                                                                index={idx}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button className="w-full md:w-auto">
                                                <Plus className="w-5 h-5" />
                                                Add Subcategory
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {(!categories || categories.length === 0) && (
                    <ZeroState
                        title="No categories yet"
                        description="Start organizing your products by creating your first category. You can add images and subcategories to make navigation easier."
                        icon={<FileImage className="w-8 h-8 text-gray-400" />}
                    />
                )}
            </div>
        </React.Fragment>
    );
};

export default CategoryTree;
