"use client";

import React from "react";

import ServerError from "@/components/generic/server-error";
import { useCategories } from "@/lib/hooks/useCategories";
import CategoryTree from "@/components/admin/categories/tree";
import { Category } from "@/schemas/product";
import ComponentLoader from "@/components/component-loader";

const CategoryView: React.FC = () => {
    const { data, isLoading, error } = useCategories();

    if (error) {
        return <ServerError />;
    }

    const categories = data?.filter((cat: Category) => !cat.parent_id);

    return (
        <div className="max-w-7xl w-full mx-auto px-2 md:px-4">
            {isLoading ? <ComponentLoader className="h-[80vh]" /> : <CategoryTree categories={categories} />}
        </div>
    );
};

export default CategoryView;
