"use client";

import React from "react";
import { FunnelIcon, X } from "nui-react-icons";
import useWatch from "@lib/hooks/use-watch";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { filters } from "./data";
import { CollectionsSideBar } from "./sidebar";

import { Button } from "@/components/ui/button";
import { Brand, Category, Collection } from "@/lib/models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface ComponentProps {
    count: any;
    slug?: string;
    sortBy?: string;
    brands?: Brand[];
    categories?: Category[];
    collections?: Collection[];
}

const CollectionsTopBar: React.FC<ComponentProps> = ({ slug, count, sortBy, brands = [], categories = [], collections = [] }) => {
    const { updateQuery } = useUpdateQuery();
    const [value, setValue] = React.useState<string>(sortBy || "created_at:desc");
    const state = useOverlayTriggerState({});

    useWatch(value, (newValue: any) => {
        updateQuery([{ key: "sortBy", value: newValue }]);
    });

    return (
        <React.Fragment>
            <header className="relative z-20 flex flex-col sm:gap-2 rounded-xl bg-content1 px-4 pb-3 pt-2 md:pt-3">
                <div className="flex items-center justify-between gap-2 ">
                    <div className="flex flex-row gap-2">
                        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                            <DrawerTrigger asChild>
                                <Button size="sm" aria-label="filters" className="md:hidden" onClick={state.open}>
                                    <FunnelIcon className="text-default-500 mr-1" focusable="false" role="img" size={16} />
                                    Filters ({count})
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <h2 className="text-lg font-semibold">Filters</h2>
                                            <button onClick={() => state.close()} className="p-2">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </DrawerTitle>
                                </DrawerHeader>
                                <CollectionsSideBar brands={brands} categories={categories} collections={collections} />
                            </DrawerContent>
                        </Drawer>
                        <div className="hidden items-center gap-1 md:flex">
                            <h2 className="text-base font-medium capitalize">{slug ?? "Collections"}</h2>
                            <span className="text-sm text-default-500">({count})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                        <Select defaultValue={value} onValueChange={(e) => setValue(e)}>
                            <SelectTrigger>
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
                        {/* <select className="md:w-[18rem] w-auto flex-1" name="filter" value={value} onChange={(e) => setValue(e.target.value)}>
                            {filters.map((filter, idx: number) => (
                                <option key={idx} value={filter.id}>
                                    {filter.name}
                                </option>
                            ))}
                        </select> */}
                    </div>
                </div>
            </header>
        </React.Fragment>
    );
};

export { CollectionsTopBar };
