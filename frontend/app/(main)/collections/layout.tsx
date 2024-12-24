import React from "react";
import { getCategories, getCollectionsList } from "@lib/data";
import { Category, SortOptions } from "types/global";
import { CollectionsSideBar } from "@/modules/collections/templates/sidebar";

type Props = {
    children: React.ReactNode;
    params?: { slug: string };
    searchParams?: {
        page?: number;
        sortBy?: SortOptions;
        cat_ids?: string;
    };
};

export default async function CheckoutLayout({ children }: Props) {
    const { collections } = await getCollectionsList();

    const { categories: cat } = await getCategories();
    const categories = cat?.filter((cat: Category) => !cat.parent_id);

    return (
        <React.Fragment>
            <div className="w-full md:px-2 lg:px-24 py-0 md:py-4">
                <div className="flex gap-6 mt-0 md:mt-6">
                    <div className="hidden md:block">
                        <CollectionsSideBar categories={categories} collections={collections} />
                    </div>
                    <div className="w-full flex-1 flex-col">{children}</div>
                </div>
            </div>
        </React.Fragment>
    );
}
