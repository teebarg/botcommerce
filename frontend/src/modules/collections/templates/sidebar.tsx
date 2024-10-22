"use client";

import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Category, Collection } from "types/global";
import { CheckboxGroup } from "@modules/common/components/checkbox-group";

interface ComponentProps {
    collections: Collection[];
    categories: Category[];
}

const CollectionsSideBar: React.FC<ComponentProps> = ({ collections, categories }) => {
    return (
        <div className="h-full min-w-[20rem] max-w-[20rem] overflow-x-hidden overflow-y-scroll max-h-[90vh] sticky top-16">
            <div className="h-full w-full max-w-sm rounded-medium p-6 bg-default-50">
                <div>
                    <span className="text-sm">Collections</span>
                    <hr className="shrink-0 border-none w-full h-divider my-1 bg-default-100" />
                    <div className="block mb-6 space-y-1">
                        {collections?.map((item: Collection, index: number) => (
                            <LocalizedClientLink key={index} className="block text-base" href={`/collections/${item.slug}`}>
                                {item.name}
                            </LocalizedClientLink>
                        ))}
                    </div>
                </div>
                <h2 className="text-sm font-medium text-foreground mt-8">Filter by</h2>
                <hr className="shrink-0 border-none w-full h-divider my-3 bg-default-100" />
                <div className="flex flex-col">
                    <span className="mb-2">Categories</span>
                    {categories?.map((item: Category, index: number) => (
                        <CheckboxGroup key={index} checkboxes={item.children} groupName={item.name} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export { CollectionsSideBar };
