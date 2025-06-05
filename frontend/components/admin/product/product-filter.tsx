import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Brand, Collection } from "@/types/models";
import { Separator } from "@/components/ui/separator";

interface ProductFilterProps {
    collections?: Collection[];
    brands?: Brand[];
    selectedCollections: number[];
    selectedBrands: number[];
    onApplyFilters: (collections: number[], brands: number[]) => void;
    onClose: () => void;
}

const ProductFilter = ({ collections, brands, selectedCollections, selectedBrands, onApplyFilters, onClose }: ProductFilterProps) => {
    const [tempCollections, setTempCollections] = useState<number[]>(selectedCollections);
    const [tempBrands, setTempBrands] = useState<number[]>(selectedBrands);

    const handleToggleCollection = (id: number) => {
        if (tempCollections.includes(id)) {
            setTempCollections(tempCollections.filter((collectionId) => collectionId !== id));
        } else {
            setTempCollections([...tempCollections, id]);
        }
    };

    const handleToggleBrand = (id: number) => {
        if (tempBrands.includes(id)) {
            setTempBrands(tempBrands.filter((brandId) => brandId !== id));
        } else {
            setTempBrands([...tempBrands, id]);
        }
    };

    const handleApply = () => {
        onApplyFilters(tempCollections, tempBrands);
        onClose();
    };

    const handleReset = () => {
        setTempCollections([]);
        setTempBrands([]);
    };

    return (
        <React.Fragment>
            <p className="px-4 text-default-500 text-sm font-medium">Filter products by collections and brands</p>
            <Separator />
            <div className="flex-1 overflow-auto p-4">
                {collections?.length && (
                    <div className="mb-6">
                        <h3 className="font-medium text-default-900 mb-3">Collections</h3>
                        <div className="flex flex-wrap gap-2">
                            {collections?.map((collection: Collection, idx: number) => (
                                <button
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full text-sm ${
                                        tempCollections.includes(collection.id) ? "bg-secondary text-white" : "bg-card text-default-800"
                                    }`}
                                    onClick={() => handleToggleCollection(collection.id)}
                                >
                                    {collection.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {brands?.length && (
                    <div className="mb-6">
                        <h3 className="font-medium text-default-900 mb-3">Brands</h3>
                        <div className="flex flex-wrap gap-2">
                            {brands?.map((brand: Brand, idx: number) => (
                                <button
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full text-sm ${
                                        tempBrands.includes(brand.id) ? "bg-secondary text-white" : "bg-card text-default-800"
                                    }`}
                                    onClick={() => handleToggleBrand(brand.id)}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Separator />
            <div className="px-4 py-2 flex gap-3 justify-between">
                <Button className="flex-1" variant="outline" onClick={handleReset}>
                    Reset
                </Button>
                <Button className="flex-1" variant="primary" onClick={handleApply}>
                    Apply Filters
                </Button>
            </div>
        </React.Fragment>
    );
};

export default ProductFilter;
