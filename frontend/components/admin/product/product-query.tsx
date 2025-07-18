"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ProductFilter from "./product-filter";

import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";
import { Collection, Brand } from "@/schemas/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    const filterState = useOverlayTriggerState({});

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
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-default-500" size={18} />
            </div>
            <input
                className="pl-10 pr-12 py-2 w-full border border-default-200 rounded-lg focus:outline-none"
                placeholder="Search products..."
                type="text"
                value={searchQuery}
                onChange={handleSearch}
            />
            <Dialog open={filterState.isOpen} onOpenChange={filterState.setOpen}>
                <DialogTrigger asChild>
                    <Button className="absolute inset-y-0 right-0 pr-3" size="iconOnly">
                        <SlidersHorizontal className="text-default-500 h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-content1">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Filter Products</DialogTitle>
                    </DialogHeader>
                    <ProductFilter
                        brands={brands}
                        collections={collections}
                        selectedBrands={selectedBrands}
                        selectedCollections={selectedCollections}
                        onApplyFilters={handleApplyFilters}
                        onClose={filterState.close}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
