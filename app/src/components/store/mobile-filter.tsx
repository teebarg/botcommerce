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
import { useSearch } from "@tanstack/react-router";

interface MobileFilterProps {
    facets?: Facet;
}

type Filters = {
    ages: string;
    sizes: string;
    colors: string;
    cat_ids: string;
    sort: "id:desc" | "created_at:desc";
    width: string | undefined;
    length: string | undefined;
    max_price: string | undefined;
    min_price: string | undefined;
};

const DEFAULTS: Filters = {
    ages: "",
    sizes: "",
    colors: "",
    cat_ids: "",
    sort: "id:desc",
    width: undefined,
    length: undefined,
    max_price: undefined,
    min_price: undefined,
};

function parseFilters(search: Record<string, unknown>): Filters {
    return {
        ages: search.ages as string,
        sizes: search.sizes as string,
        colors: search.colors as string,
        cat_ids: search.cat_ids as string,
        sort: search.sort as "id:desc" | "created_at:desc",
        width: search.width as string,
        length: search.length as string,
        max_price: search.max_price as string,
        min_price: search.min_price as string,
    };
}

function countActiveFilters(filters: Filters): number {
    let count = 0;
    if (filters.ages && filters.ages !== DEFAULTS.ages) count++;
    if (filters.sizes && filters.sizes !== DEFAULTS.sizes) count++;
    if (filters.colors && filters.colors !== DEFAULTS.colors) count++;
    if (filters.cat_ids && filters.cat_ids !== DEFAULTS.cat_ids) count++;
    if (filters.sort && filters.sort !== DEFAULTS.sort) count++;
    if (filters.width && filters.width !== DEFAULTS.width) count++;
    if (filters.length && filters.length !== DEFAULTS.length) count++;
    if (filters.max_price && filters.max_price !== DEFAULTS.max_price) count++;
    if (filters.min_price && filters.min_price !== DEFAULTS.min_price) count++;
    return count;
}

const MobileFilter: React.FC<MobileFilterProps> = ({ facets }) => {
    const { location } = useRouterState();
    const filterState = useOverlayTriggerState({});
    const sidebarRef = useRef<FilterSidebarRef>(null);
    const search = useSearch({ strict: false }) as Record<string, unknown>;
    const activeCount = countActiveFilters(parseFilters(search));

    const filterRoutes = ["/collections", "/search"];

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
                        {activeCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                                {activeCount}
                            </span>
                        )}
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
