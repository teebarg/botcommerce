"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

import ProductFilter from "./product-filter";

import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";
import { Collection, Brand } from "@/types/models";

interface ProductQueryProps {
    collections?: Collection[];
    brands?: Brand[];
    selectedCollections: number[];
    selectedBrands: number[];
}

export function ProductQuery({ collections, brands, selectedCollections, selectedBrands }: ProductQueryProps) {
    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery(500);

    const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const handleApplyFilters = (collections: number[], brands: number[]) => {
        updateQuery([
            { key: "collections", value: collections.join(",") },
            { key: "brands", value: brands.join(",") },
        ]);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        updateQuery([{ key: "search", value: e.target.value }]);
    };

    return (
        <>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-default-500" size={18} />
                </div>
                <input
                    className="pl-10 pr-12 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Search products..."
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setFilterOpen(true)}>
                    <SlidersHorizontal className="text-default-500" size={18} />
                </button>
            </div>
            <ProductFilter
                brands={brands}
                collections={collections}
                open={filterOpen}
                selectedBrands={selectedBrands}
                selectedCollections={selectedCollections}
                onApplyFilters={handleApplyFilters}
                onOpenChange={setFilterOpen}
            />
        </>
    );
}
