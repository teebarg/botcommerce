import { Metadata } from "next";
import { Collection, Product } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { getCategories, getCollectionsList, getCustomer } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { CollectionForm } from "@modules/admin/collections/collection-form";
import { Chip } from "@modules/common/components/chip";
import { deleteCollection } from "@modules/admin/actions";
import { ChevronDown, DotsSix, EllipsisHorizontal, EllipsisVertical, Folder, Plus, Tag } from "nui-react-icons";
import CategoryTree from "@modules/admin/categories/tree";

export const metadata: Metadata = {
    title: "Children clothing | TBO Store",
    description: "A performant frontend ecommerce starter template with Next.js.",
};

export default async function CategoriesPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "100", 10);
    const { categories: cat } = await getCategories(search, page, limit);
    const categories = cat.filter((cat: any) => !!cat.children.length);
    console.log(cat);
    console.log(categories);
    const customer = await getCustomer().catch(() => null);

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-2">Products</h1>
                    <div className="py-4">
                        <ProductUpload customer={customer} />
                    </div>
                    <React.Fragment>
                        <div className="flex h-full grow flex-col">
                            <div className="flex w-full grow flex-col">
                                <div className="rounded-md border-default-100 flex h-full w-full flex-col overflow-hidden border min-h-[350px]">
                                    <div className="relative" />
                                    <div className="flex grow flex-col border-default-100 border-b border-solid">
                                        <div className="px-8 py-8 border-default-100 border-b border-solid">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h1 className="text-default-700 font-semibold">Product Categories</h1>
                                                    <h3 className="text-default-600 text-sm pt-1.5">Helps you to keep your products organized.</h3>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div>
                                                        <button type="button" className="btn btn-secondary btn-small flex items-center">
                                                            <span className="mr-2 last:mr-0">Add category</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-8">
                                            <div className="flex flex-col grow">
                                                <div style={{ pointerEvents: "initial", position: "relative" }}>
                                                    <div className="">
                                                        <CategoryTree categories={categories} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-h-[40px]" />
                                </div>
                                <div className="h-xlarge w-full" />
                            </div>
                        </div>
                    </React.Fragment>
                </div>
            </div>
        </React.Fragment>
    );
}
