import React from "react";
import { Metadata } from "next";

import CategoryView from "@/components/admin/categories/categories-view";
import ClientOnly from "@/components/client-only";

export const metadata: Metadata = {
    title: "Categories",
};

export default async function CategoriesPage() {
    return (
        <ClientOnly>
            <CategoryView />
        </ClientOnly>
    );
}
