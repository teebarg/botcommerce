"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, FileImage, Plus } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import CategoryAction from "./categories-control";
import CategoryImageManager from "./category-image";
import { CategoryForm } from "./category-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Category } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

interface Props {
    categories?: Category[];
}

const CategoryImage: React.FC<{ image: string | undefined; className: string; categoryId: number }> = ({ image, className = "", categoryId }) => {
    const stateState = useOverlayTriggerState({});

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
            <Dialog open={stateState.isOpen} onOpenChange={stateState.setOpen}>
                <DialogTrigger>
                    <Image
                        fill
                        alt={image || "placeholder"}
                        className="w-full h-full cursor-pointer text-gray-400"
                        src={image || "/placeholder.jpg"}
                    />
                </DialogTrigger>
                <DialogContent className="bg-content1">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Update Category Image</DialogTitle>
                    </DialogHeader>
                    <CategoryImageManager categoryId={categoryId} initialImage={image} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

const CategoryTree: React.FC<Props> = ({ categories }) => {
    const addState = useOverlayTriggerState({});
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const toggleCategory = (id: number) => {
        setExpandedCategories((prev: number[]) => (prev.includes(id) ? prev.filter((item: number) => item !== id) : [...prev, id]));
    };

    return (
        <React.Fragment>
            <div className="w-full max-w-6xl mx-auto p-2 md:p-4 space-y-6">
                <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Product Categories</h1>
                            <p className="text-primary-100 text-lg">Organize and manage your product catalog with ease</p>
                            <div className="flex items-center gap-4 mt-4 text-sm">
                                <span className="bg-white/20 px-3 py-1 rounded-full">{categories?.length || 0} Categories</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full">
                                    {categories?.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)} Subcategories
                                </span>
                            </div>
                        </div>
                        <Overlay
                            open={addState.isOpen}
                            title="Create Category"
                            trigger={
                                <Button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 shadow-lg" size="lg">
                                    <Plus className="w-5 h-5" />
                                    Add New Category
                                </Button>
                            }
                            onOpenChange={addState.setOpen}
                        >
                            <CategoryForm type="create" onClose={addState.close} />
                        </Overlay>
                    </div>
                </div>

                <div className="space-y-4">
                    {categories?.map((category) => (
                        <div
                            key={category.id}
                            className="bg-card rounded-2xl shadow-sm border border-divider overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Main Category */}
                            <div className="group">
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <CategoryImage
                                            categoryId={category.id}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0"
                                            image={category.image}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xl font-semibold text-default-900 mb-2 truncate">{category.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <Badge variant={category.is_active ? "emerald" : "destructive"}>
                                                            {category.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                        {category?.subcategories && category?.subcategories?.length > 0 && (
                                                            <Badge variant="default">{category.subcategories.length} subcategories</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
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
                                                    <CategoryAction category={category} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {category?.subcategories && category?.subcategories?.length > 0 && expandedCategories.includes(category.id) && (
                                    <div className="border-t border-divider bg-content3">
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {category?.subcategories?.map((subcategory, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-card rounded-xl p-4 border border-divider hover:shadow-sm transition-shadow group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <CategoryImage
                                                                categoryId={subcategory.id}
                                                                className="w-12 h-12 rounded-lg flex-shrink-0"
                                                                image={subcategory.image}
                                                            />

                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-default-900 truncate mb-1">{subcategory.name}</h4>
                                                                <Badge variant={subcategory.is_active ? "emerald" : "destructive"} />
                                                            </div>
                                                            <CategoryAction canAdd={false} category={subcategory} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button className="w-full md:w-auto" variant="primary">
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
                    <div className="bg-card rounded-2xl p-12 text-center border-2 border-dashed border-divider">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileImage className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-default-900 mb-2">No categories yet</h3>
                        <p className="text-default-500 mb-6 max-w-md mx-auto">
                            Start organizing your products by creating your first category. You can add images and subcategories to make navigation
                            easier.
                        </p>
                        <Button className="w-full md:w-auto" variant="primary">
                            <Plus className="w-5 h-5" />
                            Create First Category
                        </Button>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};

export default CategoryTree;
