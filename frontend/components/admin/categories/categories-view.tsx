"use client";

import React from "react";

import ServerError from "@/components/generic/server-error";
import { useCategories } from "@/lib/hooks/useApi";
import { Skeleton } from "@/components/generic/skeleton";
import CategoryTree from "@/components/admin/categories/tree";
import { Category } from "@/schemas/product";

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
        <div className="max-w-7xl mx-auto">
            <div className="flex h-full grow px-2 md:px-4">
                <CategoryTree categories={categories} />
            </div>
        </div>
    );
};

export default CategoryView;
