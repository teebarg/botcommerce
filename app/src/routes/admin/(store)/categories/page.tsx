import React from "react";
import { Metadata } from "next";

import CategoryView from "@/components/admin/categories/categories-view";

export const metadata: Metadata = {
    title: "Categories",
};

export default async function CategoriesPage() {
    return <CategoryView />;
}
