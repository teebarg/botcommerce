"use client";

import React, { useEffect, useState } from "react";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSearchParams } from "next/navigation";

import { CheckboxGroup } from "@/components/store/collections/checkbox-group";
import RangeSlider from "@/components/ui/range-slider";
import { Checkbox } from "@/components/ui/checkbox";
import LocalizedClientLink from "@/components/ui/link";
import { Brand, Category, Collection, Facet } from "@/schemas/product";
import { Separator } from "@/components/ui/separator";
import ClientOnly from "@/components/generic/client-only";

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

    const onPriceChange = (values: number[]) => {
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
        updateQuery([{ key: "brand_id", value: Array.from(newSet).join(",") }]);
    };

    useEffect(() => {
        const brandIdsFromURL = searchParams.get("brand_id")?.split(",") || [];

        const newSet = new Set(brandIdsFromURL);

        setDataSet(newSet);
    }, [searchParams]);

    return (
        <div className="h-full min-w-[20rem] md:max-w-[20rem] overflow-x-hidden overflow-y-scroll max-h-[90vh] sticky top-16 bg-content1 rounded-xl">
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
                        <div className="max-h-[20vh] overflow-y-scroll">
                            {(categories || []).map((item: Category, idx: number) => (
                                <CheckboxGroup key={idx} checkboxes={item.subcategories} facets={facets} groupName={item.slug} item={item as any} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col mt-6">
                        <span className="text-sm">Brands</span>
                        <div className="max-h-[20vh] overflow-y-scroll">
                            {brands?.map((item: Brand, idx: number) => (
                                <div key={`brand-${idx}`} className="flex justify-between mt-2">
                                    <div className="flex items-center gap-1">
                                        <Checkbox
                                            checked={dataSet.has(item.slug)}
                                            onCheckedChange={(checked) => onBrandChange(checked == "indeterminate" ? false : checked, item.slug)}
                                        />
                                        <label>{item.name}</label>
                                    </div>
                                    {facets?.brand && <span>({facets["brand"][item.name] ?? 0})</span>}
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
