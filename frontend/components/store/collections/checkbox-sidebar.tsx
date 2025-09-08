"use client";

import React, { useEffect, useState } from "react";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSearchParams } from "next/navigation";

import { CheckboxGroup } from "@/components/store/collections/checkbox-group";
import RangeSlider from "@/components/ui/range-slider";
import LocalizedClientLink from "@/components/ui/link";
import { Category, Collection, Facet } from "@/schemas/product";
import { Separator } from "@/components/ui/separator";
import ClientOnly from "@/components/generic/client-only";
import { SIZE_OPTIONS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

interface ComponentProps {
    collections?: Collection[];
    categories?: Category[];
    facets?: Facet;
}

const CollectionsSideBar: React.FC<ComponentProps> = ({ collections, categories, facets }) => {
    const [dataSet, setDataSet] = useState(new Set());
    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery();

    const onPriceChange = (values: number[]) => {
        const [minPrice, maxPrice] = values;

        updateQuery([
            { key: "minPrice", value: minPrice.toString() },
            { key: "maxPrice", value: maxPrice.toString() },
        ]);
    };

    const onSizeChange = (checked: boolean, slug: string) => {
        const newSet = new Set(dataSet);

        if (checked) {
            newSet.add(slug);
        } else {
            newSet.delete(slug);
        }

        setDataSet(newSet);
        updateQuery([{ key: "sizes", value: Array.from(newSet).join(",") }]);
    };

    useEffect(() => {
        const sizesFromURL = searchParams.get("sizes")?.split(",") || [];

        const newSet = new Set(sizesFromURL);

        setDataSet(newSet);
    }, [searchParams]);

    return (
        <div className="h-full min-w-[20rem] md:max-w-[20rem] overflow-x-hidden overflow-y-scroll max-h-[90vh] sticky top-16 bg-content1 rounded-xl pb-12">
            <ClientOnly>
                <div className="w-full max-w-sm p-6">
                    <div>
                        <span className="text-sm">Collections</span>
                        <div className="block mb-6 space-y-0.5">
                            {collections?.map((item: Collection, idx: number) => (
                                <LocalizedClientLink key={idx} className="flex justify-between" href={`/collections/${item.slug}`}>
                                    {item.name} {facets?.collection_slugs && <span>({facets["collection_slugs"][item.slug] ?? 0})</span>}
                                </LocalizedClientLink>
                            ))}
                        </div>
                    </div>
                    <h2 className="text-sm font-medium text-foreground mt-8">Filter by</h2>
                    <Separator className="mb-4" />
                    <RangeSlider
                        defaultValue={[Number(searchParams?.get("minPrice") ?? 500), Number(searchParams?.get("maxPrice") ?? 50000)]}
                        label="Price Range"
                        max={100000}
                        min={0}
                        step={500}
                        onChange={onPriceChange}
                    />
                    <div className="flex flex-col mt-6">
                        <span className="mb-2 text-sm">Categories</span>
                        <div className="max-h-[25vh] overflow-y-scroll">
                            {(categories || []).map((item: Category, idx: number) => (
                                <CheckboxGroup key={idx} checkboxes={item.subcategories} facets={facets} groupName={item.slug} item={item as any} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col mt-6">
                        <span className="text-sm">Sizes</span>
                        <div className="max-h-[25vh] overflow-y-scroll">
                            {SIZE_OPTIONS?.map((item: string, idx: number) => (
                                <div key={`size-${idx}`} className="flex justify-between mt-2">
                                    <div className="flex items-center gap-1">
                                        <Checkbox
                                            checked={dataSet.has(item)}
                                            onCheckedChange={(checked) => onSizeChange(checked == "indeterminate" ? false : checked, item)}
                                        />
                                        <label>Uk {item}</label>
                                    </div>
                                    {facets?.sizes && <span>({facets["sizes"][item] ?? 0})</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ClientOnly>
        </div>
    );
};

export { CollectionsSideBar };
