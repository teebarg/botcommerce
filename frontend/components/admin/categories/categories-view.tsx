"use client";

import React from "react";

import ServerError from "@/components/server-error";
import { useCategories } from "@/lib/hooks/useAdmin";
import { Skeleton } from "@/components/skeleton";
import CreateCategory from "@/components/admin/categories/create-categories";
import CategoryTree from "@/components/admin/categories/tree";
import { Category } from "@/types/models";

const CategoryView: React.FC = () => {
    const { data, isLoading, error } = useCategories();

    if (error) {
        return <ServerError />;
    }

    if (isLoading) {
        return <Skeleton className="h-[400px]" />;
    }

    const categories = data?.filter((cat: Category) => !cat.parent_id);

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                <div className="flex h-full grow flex-col">
                    <div className="flex w-full grow flex-col">
                        <div className="rounded-md border-default/20 flex h-full w-full flex-col overflow-hidden border min-h-[350px]">
                            <div>
                                <div className="py-4 px-4 border-default-100 border-b border-solid">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-default-900 font-semibold text-xl">Product Categories</h1>
                                            <h3 className="text-default-500 text-sm">Helps you to keep your products organized.</h3>
                                        </div>
                                        <CreateCategory />
                                    </div>
                                </div>
                                <div className="px-4 pt-4 relative" style={{ pointerEvents: "initial" }}>
                                    <CategoryTree categories={categories} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryView;
