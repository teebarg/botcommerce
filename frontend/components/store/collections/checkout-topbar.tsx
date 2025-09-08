"use client";

import React from "react";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Filter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { filters } from "./data";
import { CollectionsSideBar } from "./checkbox-sidebar";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Category, Collection } from "@/schemas/product";
import { Separator } from "@/components/ui/separator";
import ClientOnly from "@/components/generic/client-only";

interface ComponentProps {
    count: any;
    slug?: string;
    sortBy?: string;
    categories?: Category[];
    collections?: Collection[];
}

const CollectionsTopBar: React.FC<ComponentProps> = ({ slug, count, sortBy, categories = [], collections = [] }) => {
    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery();
    const state = useOverlayTriggerState({});

    const value = searchParams.get("sortBy") || "created_at:desc";

    const handleSortChange = (newValue: string) => {
        updateQuery([{ key: "sortBy", value: newValue }]);
    };

    return (
        <header className="relative z-20 overflow-hidden px-1">
            <ClientOnly>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                            <DrawerTrigger asChild>
                                <Button
                                    aria-label="filters"
                                    className="md:hidden"
                                    size="sm"
                                    startContent={<Filter className="w-4 h-4" />}
                                    variant="primary"
                                    onClick={state.open}
                                >
                                    Filters ({count})
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader className="p-0 pt-4">
                                    <DrawerTitle>
                                        <div className="flex items-center justify-between px-4">
                                            <h2 className="text-lg font-semibold">Filters</h2>
                                            <Button size="iconOnly" onClick={() => state.close()}>
                                                <X />
                                            </Button>
                                        </div>
                                        <Separator />
                                    </DrawerTitle>
                                </DrawerHeader>
                                <CollectionsSideBar categories={categories} collections={collections} />
                            </DrawerContent>
                        </Drawer>
                        <div className="hidden items-center gap-1 md:flex">
                            <h2 className="text-base font-medium capitalize">{slug ?? "Collections"}</h2>
                            {/* <span className="text-sm text-default-500">({count})</span> */}
                        </div>
                    </div>
                    <div>
                        <Select defaultValue={value} onValueChange={handleSortChange}>
                            <SelectTrigger className="bg-content1 border-divider focus:border-primary">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {filters.map((filter, idx: number) => (
                                    <SelectItem key={idx} value={filter.id}>
                                        {filter.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </ClientOnly>
        </header>
    );
};

export { CollectionsTopBar };
