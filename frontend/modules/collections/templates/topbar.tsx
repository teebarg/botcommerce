"use client";

import React from "react";
import { FunnelIcon } from "nui-react-icons";
import useWatch from "@lib/hooks/use-watch";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { ComboBox } from "@modules/common/components/combobox";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { SlideOver } from "@modules/common/components/slideover";
import { Brand, Category, Collection } from "types/global";

import { filters } from "./data";
import { CollectionsSideBar } from "./sidebar";
import { Button } from "@/components/ui/button";

interface ComponentProps {
    count: any;
    slug?: string;
    sortBy?: string;
    brands?: Brand[];
    categories?: Category[];
    collections?: Collection[];
}

const CollectionsTopBar: React.FC<ComponentProps> = ({ slug, count, sortBy, brands = [], categories = [], collections = [] }) => {
    const { updateQuery } = useUpdateQuery(1000);
    const [value, setValue] = React.useState<string>(sortBy || "created_at:desc");
    const state = useOverlayTriggerState({});

    useWatch(value, (newValue: any) => {
        updateQuery([{ key: "sortBy", value: newValue }]);
    });

    return (
        <React.Fragment>
            <header className="relative z-20 flex flex-col sm:gap-2 rounded-medium bg-default-100 px-4 pb-3 pt-2 md:pt-3">
                <div className="flex items-center justify-between gap-2 ">
                    <div className="flex flex-row gap-2">
                        <Button className="md:hidden" onClick={state.open}>
                            <FunnelIcon className="text-default-500" focusable="false" role="img" size={16} />
                            Filters ({count})
                        </Button>
                        <div className="hidden items-center gap-1 md:flex">
                            <h2 className="text-medium font-medium capitalize">{slug ?? "Collections"}</h2>
                            <span className="text-small text-default-500">({count})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                        <ComboBox
                            className="min-w-[15rem] max-w-xs flex-1"
                            items={filters}
                            name="filter"
                            placeholder="Filter products"
                            selectedKey={value}
                            onSelectionChange={setValue}
                        />
                    </div>
                </div>
            </header>
            {state.isOpen && (
                <SlideOver className="bg-default-100" isOpen={state.isOpen} title="Filters" onClose={state.close}>
                    <CollectionsSideBar brands={brands} categories={categories} collections={collections} />
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export { CollectionsTopBar };
