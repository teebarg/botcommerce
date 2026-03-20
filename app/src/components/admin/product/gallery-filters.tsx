"use client";

import { useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";


type Filters = {
    sort: "newest" | "oldest";
    active: "true" | "false" | "all";
    out_of_stock: boolean;
};

const DEFAULTS: Filters = {
    sort: "newest",
    active: "all",
    out_of_stock: false,
};

function parseFilters(search: Record<string, unknown>): Filters {
    return {
        sort: search.sort === "oldest" ? "oldest" : "newest",
        active: search.active === "true" ? "true" : search.active === "false" ? "false" : "all",
        out_of_stock: search.out_of_stock === "true",
    };
}

function countActiveFilters(filters: Filters): number {
    let count = 0;
    if (filters.sort !== DEFAULTS.sort) count++;
    if (filters.active !== DEFAULTS.active) count++;
    if (filters.out_of_stock !== DEFAULTS.out_of_stock) count++;
    return count;
}

export function GalleryFilters() {
    const { updateQuery } = useUpdateQuery();
    const search = useSearch({ strict: false }) as Record<string, unknown>;
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<Filters>(() => parseFilters(search));

    // Sync draft when URL changes externally
    useEffect(() => {
        setDraft(parseFilters(search));
    }, [search.sort, search.active, search.out_of_stock]);

    function handleApply() {
        updateQuery([
            { key: "sort", value: draft.sort === DEFAULTS.sort ? "" : draft.sort },
            { key: "active", value: draft.active === DEFAULTS.active ? "" : draft.active },
            { key: "out_of_stock", value: draft.out_of_stock ? "true" : "" },
        ]);
        setOpen(false);
    }

    function handleReset() {
        setDraft(DEFAULTS);
        updateQuery([
            { key: "sort", value: "" },
            { key: "active", value: "" },
            { key: "out_of_stock", value: "" },
        ]);
        setOpen(false);
    }

    const activeCount = countActiveFilters(parseFilters(search));
    const isDirty =
        draft.sort !== parseFilters(search).sort ||
        draft.active !== parseFilters(search).active ||
        draft.out_of_stock !== parseFilters(search).out_of_stock;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72 p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium">Filters</span>
                    {activeCount > 0 && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Clear all
                        </button>
                    )}
                </div>

                <Separator />

                <div className="space-y-5 px-4 py-4">
                    {/* Sort */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort by</Label>
                        <ToggleGroup
                            type="single"
                            value={draft.sort}
                            onValueChange={(val) => val && setDraft((d) => ({ ...d, sort: val as Filters["sort"] }))}
                            className="grid grid-cols-2 gap-1"
                        >
                            <ToggleGroupItem value="newest" className="h-8 text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
                                Newest
                            </ToggleGroupItem>
                            <ToggleGroupItem value="oldest" className="h-8 text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
                                Oldest
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {/* Active status */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</Label>
                        <ToggleGroup
                            type="single"
                            value={draft.active}
                            onValueChange={(val) => val && setDraft((d) => ({ ...d, active: val as Filters["active"] }))}
                            className="grid grid-cols-3 gap-1"
                        >
                            <ToggleGroupItem value="all" className="h-8 text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
                                All
                            </ToggleGroupItem>
                            <ToggleGroupItem value="true" className="h-8 text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
                                Active
                            </ToggleGroupItem>
                            <ToggleGroupItem value="false" className="h-8 text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
                                Inactive
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {/* Out of stock */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Out of stock</Label>
                            <p className="text-xs text-muted-foreground">Show only sold out items</p>
                        </div>
                        <Switch checked={draft.out_of_stock} onCheckedChange={(val) => setDraft((d) => ({ ...d, out_of_stock: val }))} />
                    </div>
                </div>

                <Separator />

                {/* Footer */}
                <div className="flex gap-2 px-4 py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            setDraft(parseFilters(search));
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleApply} disabled={!isDirty}>
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
