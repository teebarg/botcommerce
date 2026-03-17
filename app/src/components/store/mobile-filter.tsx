import type React from "react";
import type { Facet } from "@/schemas/product";
import { useRef } from "react";
import { SlidersHorizontal } from "lucide-react";
import Overlay from "@/components/overlay";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouterState } from "@tanstack/react-router";
import { FilterSidebarLogic, FilterSidebarRef } from "./catalog/filter-sidebar-logic";

interface MobileFilterProps {
    facets?: Facet;
}

const MobileFilter: React.FC<MobileFilterProps> = ({ facets }) => {
    const { location } = useRouterState();
    const filterState = useOverlayTriggerState({});
    const sidebarRef = useRef<FilterSidebarRef>(null);

    const filterRoutes = ["/collections", "/search", "/catalog"];

    const showFilter = filterRoutes.some((route) => location.pathname.startsWith(route));

    if (!showFilter) {
        return null;
    }

    return (
        <Overlay
            open={filterState.isOpen}
            title={
                <div className="flex items-center justify-between w-full">
                    <h2 className="font-semibold">FILTER & SORT</h2>
                </div>
            }
            trigger={
                <div className="flex items-center justify-between px-4 py-3">
                    <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground transition-colors hover:text-muted-foreground">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                    </button>
                </div>
            }
            onOpenChange={filterState.setOpen}
            side="left"
        >
            <div className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 px-6">
                    <FilterSidebarLogic ref={sidebarRef} facets={facets} onClose={filterState.close} />
                </ScrollArea>
                <div className="flex justify-center gap-2 p-4 border-t border-border">
                    <Button className="w-full rounded-full py-6" onClick={() => sidebarRef.current?.apply()}>
                        Apply
                    </Button>
                    <Button className="w-full rounded-full py-6" variant="destructive" onClick={() => sidebarRef.current?.clear()}>
                        Clear
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};

export default MobileFilter;
