import React from "react";
import { Metadata } from "next";
import { Category } from "types/global";
import { getCategories } from "@lib/data";
import CategoryTree from "@modules/admin/categories/tree";
import AddCategory from "@modules/admin/categories/add-categories";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
    title: `Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

export default async function CategoriesPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "100", 10);
    const { categories: cat } = await getCategories(search, page, limit);
    const categories = cat?.filter((cat: Category) => !cat.parent_id);

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <div className="flex h-full grow flex-col">
                        <div className="flex w-full grow flex-col">
                            <div className="rounded-md border-default-100 flex h-full w-full flex-col overflow-hidden border min-h-[350px]">
                                <div>
                                    <div className="p-8 border-default-100 border-b border-solid">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h1 className="text-default-900 font-semibold text-xl">Product Categories</h1>
                                                <h3 className="text-default-500 text-sm">Helps you to keep your products organized.</h3>
                                            </div>
                                            <AddCategory />
                                        </div>
                                    </div>
                                    <div className="px-8 pt-8 relative" style={{ pointerEvents: "initial" }}>
                                        <CategoryTree categories={categories} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
