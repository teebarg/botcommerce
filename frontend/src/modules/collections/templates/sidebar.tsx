"use client";

import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import useWatch from "@lib/hooks/use-watch";
import { Collection } from "types/global";

interface ComponentProps {
    collections: any[];
    categories: any[];
}

const CollectionsSideBar: React.FC<ComponentProps> = ({ collections, categories }) => {
    const { updateQuery } = useUpdateQuery(1000);

    const [catSelected, setCatSelected] = React.useState<string[]>([""]);
    const [subCatSelected, setSubCatSelected] = React.useState<string[]>([""]);

    useWatch(catSelected, () => {
        handleCatQuery();
    });

    useWatch(subCatSelected, () => {
        handleCatQuery();
    });

    const handleCatQuery = () => {
        const set = new Set([...subCatSelected, ...catSelected]);

        updateQuery([{ key: "cat_ids", value: Array.from(set).join(",") }]);
    };

    // Select all sub categories
    const selectChildren = (e: any) => {
        const selected = e.category_children.map((i: any) => i.id);
        const set = new Set([...subCatSelected, ...selected]);

        setSubCatSelected(Array.from(set));
    };

    return (
        <div className="hidden h-full min-w-[20rem] max-w-[20rem] overflow-x-hidden overflow-y-scroll sm:flex max-h-[90vh] sticky top-16">
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
                    <CheckboxGroup value={catSelected} onChange={setCatSelected}>
                        {categories
                            .filter((item) => item.parent_category_id == null)
                            .map((item, index) => (
                                <React.Fragment key={`cont-${index}`}>
                                    <Checkbox key={`cat-${index}`} value={item.id} onValueChange={(e) => e && selectChildren(item)}>
                                        {item.name}
                                    </Checkbox>
                                    <div className="pl-4">
                                        <CheckboxGroup value={subCatSelected} onChange={setSubCatSelected}>
                                            {item.category_children.map((child: any, index: number) => (
                                                <Checkbox key={`subcat-${index}`} value={child.id}>
                                                    {child.name}
                                                </Checkbox>
                                            ))}
                                        </CheckboxGroup>
                                    </div>
                                </React.Fragment>
                            ))}
                    </CheckboxGroup>
                </div>
            </div>
        </div>
    );
};

export { CollectionsSideBar };
