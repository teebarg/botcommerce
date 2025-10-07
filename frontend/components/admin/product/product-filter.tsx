import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collection } from "@/schemas/product";
import { Separator } from "@/components/ui/separator";

interface ProductFilterProps {
    collections?: Collection[];
    selectedCollections: number[];
    onApplyFilters: (collections: number[]) => void;
    onClose: () => void;
}

const ProductFilter = ({ collections, selectedCollections, onApplyFilters, onClose }: ProductFilterProps) => {
    const [tempCollections, setTempCollections] = useState<number[]>(selectedCollections);

    const handleToggleCollection = (id: number) => {
        if (tempCollections.includes(id)) {
            setTempCollections(tempCollections.filter((collectionId) => collectionId !== id));
        } else {
            setTempCollections([...tempCollections, id]);
        }
    };

    const handleApply = () => {
        onApplyFilters(tempCollections);
        onClose();
    };

    const handleReset = () => {
        setTempCollections([]);
    };

    return (
        <React.Fragment>
            <p className="px-4 text-muted-foreground text-sm font-medium">Filter products by collections</p>
            <Separator />
            <div className="flex-1 overflow-auto p-4">
                {collections?.length && (
                    <div className="mb-6">
                        <h3 className="font-medium mb-3">Collections</h3>
                        <div className="flex flex-wrap gap-2">
                            {collections?.map((collection: Collection, idx: number) => (
                                <button
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full text-sm ${
                                        tempCollections.includes(collection.id) ? "bg-indigo-500 text-white" : "bg-card text-foreground"
                                    }`}
                                    onClick={() => handleToggleCollection(collection.id)}
                                >
                                    {collection.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Separator />
            <div className="px-4 py-2 flex gap-3 justify-between">
                <Button className="flex-1" variant="destructive" onClick={handleReset}>
                    Reset
                </Button>
                <Button className="flex-1" onClick={handleApply}>
                    Apply Filters
                </Button>
            </div>
        </React.Fragment>
    );
};

export default ProductFilter;
