import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ProductFilter from "./product-filter";

import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { Collection } from "@/schemas/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductQueryProps {
    collections?: Collection[];
    selectedCollections: number[];
}

export function ProductQuery({ collections, selectedCollections }: ProductQueryProps) {
    const searchParams: any = null;
    const { updateQuery } = useUpdateQuery(500);

    const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
    const filterState = useOverlayTriggerState({});

    const handleApplyFilters = (collections: number[]) => {
        updateQuery([{ key: "collections", value: collections.join(",") }]);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        updateQuery([{ key: "search", value: e.target.value }]);
    };

    return (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-muted-foreground" size={18} />
            </div>
            <input
                className="pl-10 pr-12 py-2 w-full border border-border rounded-lg focus:outline-none"
                placeholder="Search products..."
                type="text"
                value={searchQuery}
                onChange={handleSearch}
            />
            <Dialog open={filterState.isOpen} onOpenChange={filterState.setOpen}>
                <DialogTrigger asChild>
                    <Button className="absolute inset-y-0 right-0 pr-3" size="icon">
                        <SlidersHorizontal className="text-muted-foreground h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Filter Products</DialogTitle>
                    </DialogHeader>
                    <ProductFilter
                        collections={collections}
                        selectedCollections={selectedCollections}
                        onApplyFilters={handleApplyFilters}
                        onClose={filterState.close}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
