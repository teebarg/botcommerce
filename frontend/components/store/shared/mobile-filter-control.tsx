"use client";

import { SlidersHorizontal, RectangleVertical, LayoutDashboard } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { FilterSidebar } from "@/components/store/shared/filter-sidebar";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { cn } from "@/lib/utils";
import { Facet } from "@/schemas/product";

interface Props {
    facets?: Facet;
    setViewMode: (type: "grid" | "list") => void;
    viewMode: "grid" | "list";
}

export default function MobileFilterControl({ facets, setViewMode, viewMode }: Props) {
    const editState = useOverlayTriggerState({});

    return (
        <div className="sticky top-16 z-30 bg-background border-b border-border mb-6 lg:hidden py-4 px-4 -mx-2">
            <div className="flex items-center justify-center gap-2">
                <div className="rounded-full p-1 flex items-center gap-2 bg-gray-200 dark:bg-secondary w-1/2">
                    <div
                        className={cn(
                            "rounded-full flex flex-1 items-center justify-center py-2 ease-in transition-all duration-300",
                            viewMode === "grid" && "bg-primary"
                        )}
                    >
                        <Button size="iconOnly" onClick={() => setViewMode("grid")}>
                            <LayoutDashboard className={cn("h-6 w-6 text-foreground", viewMode === "grid" && "text-white")} />
                        </Button>
                    </div>
                    <div
                        className={cn(
                            "rounded-full flex flex-1 items-center justify-center py-2 ease-in transition-all duration-300",
                            viewMode === "list" && "bg-primary"
                        )}
                    >
                        <Button size="iconOnly" onClick={() => setViewMode("list")}>
                            <RectangleVertical className={cn("h-6 w-6 text-foreground", viewMode === "list" && "text-white")} />
                        </Button>
                    </div>
                </div>
                <Overlay
                    open={editState.isOpen}
                    title="Edit Brand"
                    trigger={
                        <Button className="rounded-full w-1/2 h-12">
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
    );
}
