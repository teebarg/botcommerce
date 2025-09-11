"use client";

import { SlidersHorizontal, RectangleVertical, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { cn } from "@/lib/utils";
import { Facet } from "@/schemas/product";

interface Props {
    facets?: Facet;
}

export default function MobileFilterControl({ facets }: Props) {
    const editState = useOverlayTriggerState({});
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    return (
        <div className="sticky top-17 z-50 bg-content2 border-b border-border mb-6 lg:hidden py-4 px-4 -mx-2">
            <div className="flex items-center justify-center gap-2">
                <div className="rounded-full p-1 flex items-center gap-2 bg-gray-300 dark:bg-content3 flex-1">
                    <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "grid" && "bg-content1")}>
                        <Button size="iconOnly" onClick={() => setViewMode("grid")}>
                            <LayoutDashboard className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "list" && "bg-content1")}>
                        <Button size="iconOnly" onClick={() => setViewMode("list")}>
                            <RectangleVertical className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-full py-1 bg-gray-300 dark:bg-content3 flex-1 flex justify-center">
                    <Overlay
                        open={editState.isOpen}
                        title="Edit Brand"
                        trigger={
                            <Button className="gap-2 font-bold" variant="transparent">
                                <SlidersHorizontal className="h-5 w-5" />
                                FILTER & SORT
                            </Button>
                        }
                        onOpenChange={editState.setOpen}
                    >
                        <FilterSidebar facets={facets} />
                    </Overlay>
                </div>
            </div>
        </div>
    );
}
