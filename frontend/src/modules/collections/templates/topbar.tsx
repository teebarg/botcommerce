"use client";

import React from "react";
import { FunnelIcon } from "nui-react-icons";
import useWatch from "@lib/hooks/use-watch";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import Button from "@modules/common/components/button";

import { filters } from "./data";
import { ComboBox } from "@modules/common/components/combobox";

interface ComponentProps {
    count: any;
    slug?: string;
    sortBy?: string;
}

const CollectionsTopBar: React.FC<ComponentProps> = ({ slug, count, sortBy }) => {
    const { updateQuery } = useUpdateQuery(1000);
    const [value, setValue] = React.useState<string>(sortBy || "created_at:desc");

    useWatch(value, (newValue: any) => {
        updateQuery([{ key: "sortBy", value: newValue }]);
    });

    return (
        <header className="relative z-20 flex flex-col gap-2 rounded-medium bg-default-50 px-4 pb-3 pt-2 md:pt-3">
            <div className="flex items-center gap-1 md:hidden md:gap-2">
                <h2 className="text-large font-medium capitalize">{slug}</h2>
                <span className="text-small text-default-400">({count})</span>
            </div>
            <div className="flex items-center justify-between gap-2 ">
                <div className="flex flex-row gap-2">
                    <Button type="button">
                        <FunnelIcon className="text-default-500" focusable="false" role="img" size={16} />
                        Filters
                    </Button>
                    <div className="hidden items-center gap-1 md:flex">
                        <h2 className="text-medium font-medium capitalize">{slug ?? "Collections"}</h2>
                        <span className="text-small text-default-400">({count})</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                    <ComboBox
                        placeholder="Filter products"
                        className="min-w-[15rem] max-w-xs flex-1"
                        name="filter"
                        label="Filter"
                        items={filters}
                        onSelectionChange={setValue}
                        selectedKey={value}
                    />
                </div>
            </div>
        </header>
    );
};

export { CollectionsTopBar };
