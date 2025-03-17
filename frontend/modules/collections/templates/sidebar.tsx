"use client";

import React, { useState } from "react";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSearchParams } from "next/navigation";

import { CheckboxGroup } from "@/modules/collections/templates/checkbox-group";
import RangeSlider from "@/components/ui/range-slider";
import { Checkbox } from "@/components/ui/checkbox";
import LocalizedClientLink from "@/components/ui/link";
import { Brand, Category, Collection, Facet } from "@/lib/models";

interface ComponentProps {
    brands?: Brand[];
    collections?: Collection[];
    categories?: Category[];
    facets?: Facet;
}

const CollectionsSideBar: React.FC<ComponentProps> = ({ brands, collections, categories, facets }) => {
    const [dataSet, setDataSet] = useState(new Set());
    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery();

    const onPriceChange = (values: number | number[]) => {
        if (typeof values === "number") {
            updateQuery([{ key: "maxPrice", value: values.toString() }]);

            return;
        }
        const [minPrice, maxPrice] = values;

        updateQuery([
            { key: "minPrice", value: minPrice.toString() },
            { key: "maxPrice", value: maxPrice.toString() },
        ]);
    };

    const onBrandChange = (checked: boolean, slug: string) => {
        const newSet = new Set(dataSet);

        if (checked) {
            newSet.add(slug);
        } else {
            newSet.delete(slug);
        }

        setDataSet(newSet);
        updateQuery([{ key: "cat_ids", value: Array.from(newSet).join(",") }]);
    };

    return (
        <div className="h-full min-w-[20rem] max-w-[20rem] overflow-x-hidden overflow-y-scroll max-h-[90vh] sticky top-16 bg-default-100 rounded-xl">
            <div className="w-full max-w-sm p-6">
                <div>
                    <span className="text-sm">Collections</span>
                    <hr className="shrink-0 border-none w-full h-[1px] my-1 bg-default-100" />
                    <div className="block mb-6 space-y-1">
                        {collections?.map((item: Collection, index: number) => (
                            <LocalizedClientLink key={index} className="text-base flex justify-between" href={`/collections/${item.slug}`}>
                                {item.name} {facets?.collections && <span>({facets["collections"][item.name] ?? 0})</span>}
                            </LocalizedClientLink>
                        ))}
                    </div>
                </div>
                <h2 className="text-sm font-medium text-foreground mt-8">Filter by</h2>
                <hr className="shrink-0 border-none w-full h-[1px] my-3 bg-default-100" />
                <RangeSlider
                    defaultValue={[Number(searchParams?.get("minPrice") ?? 500), Number(searchParams?.get("maxPrice") ?? 50000)]}
                    formatOptions={{ style: "currency", currency: "NGN" }}
                    label="Price"
                    maxValue={100000}
                    step={500}
                    onChange={onPriceChange}
                />
                <div className="flex flex-col mt-2">
                    <span className="mb-2">Categories</span>
                    {categories?.map((item: Category, index: number) => (
                        <CheckboxGroup key={index} checkboxes={item.subcategories} facets={facets} groupName={item.name} item={item} />
                    ))}
                </div>
                <div className="flex flex-col mt-2">
                    <span className="mb-2">Brands</span>
                    {brands?.map((item: Brand, index: number) => (
                        <div key={`brand-${index}`} className="flex justify-between mt-2">
                            <Checkbox color="warning" label={item.name} onChange={(e) => onBrandChange(e, item.slug)} />
                            {facets?.brands && <span>({facets["brands"][item.name] ?? 0})</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { CollectionsSideBar };
