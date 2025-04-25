import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brand, Collection } from "@/types/models";

interface ProductFilterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collections?: Collection[];
    brands?: Brand[];
    selectedCollections: number[];
    selectedBrands: number[];
    onApplyFilters: (collections: number[], brands: number[]) => void;
}

const ProductFilter = ({ open, onOpenChange, collections, brands, selectedCollections, selectedBrands, onApplyFilters }: ProductFilterProps) => {
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
        onOpenChange(false);
    };

    const handleReset = () => {
        setTempCollections([]);
        setTempBrands([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-4">
                    {collections?.length && (
                        <div className="mb-6">
                            <h3 className="font-medium text-default-900 mb-3">Collections</h3>
                            <div className="flex flex-wrap gap-2">
                                {collections?.map((collection) => (
                                    <button
                                        key={collection.id}
                                        className={`px-3 py-1.5 rounded-full text-sm ${
                                            tempCollections.includes(collection.id) ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
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
                                {brands?.map((brand) => (
                                    <button
                                        key={brand.id}
                                        className={`px-3 py-1.5 rounded-full text-sm ${
                                            tempBrands.includes(brand.id) ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
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
                <div className="border-t p-4 flex gap-3 justify-between">
                    <Button className="flex-1" variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button className="flex-1" onClick={handleApply}>
                        Apply Filters
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductFilter;
