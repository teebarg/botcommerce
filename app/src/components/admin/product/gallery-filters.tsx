"use client";

import { useLocation, useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/schemas";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useOverlayTriggerState } from "react-stately";
import SheetDrawer from "@/components/sheet-drawer";

type Filters = {
    sort: "newest" | "oldest";
    active: "true" | "false" | "all";
    inventory: "out_of_stock" | "in_stock" | "all";
    category_slug: string;
    name: string;
    start_date: string;
    end_date: string;
};

const DEFAULTS: Filters = {
    sort: "newest",
    active: "all",
    inventory: "all",
    category_slug: "",
    name: "",
    start_date: "",
    end_date: "",
};

function parseFilters(search: Record<string, unknown>): Filters {
    return {
        sort: search.sort === "oldest" ? "oldest" : "newest",
        active: search.active == true ? "true" : search.active == false ? "false" : "all",
        inventory: search.inventory == "in_stock" ? "in_stock" : search.inventory == "out_of_stock" ? "out_of_stock" : "all",
        category_slug: typeof search.category_slug === "string" ? search.category_slug : "",
        name: typeof search.name === "string" ? search.name : "",
        start_date: typeof search.start_date === "string" ? search.start_date : "",
        end_date: typeof search.end_date === "string" ? search.end_date : "",
    };
}

function countActiveFilters(filters: Filters): number {
    let count = 0;
    if (filters.sort !== DEFAULTS.sort) count++;
    if (filters.active !== DEFAULTS.active) count++;
    if (filters.inventory !== DEFAULTS.inventory) count++;
    if (filters.category_slug !== DEFAULTS.category_slug) count++;
    if (filters.name !== DEFAULTS.name) count++;
    if (filters.start_date) count++;
    return count;
}

function applyDatePreset(days: number): Pick<Filters, "start_date" | "end_date"> {
    const to = new Date();
    const from = new Date();
    if (days === 0) {
        from.setHours(0, 0, 0, 0);
    } else {
        from.setDate(from.getDate() - days);
    }
    return { start_date: from.toISOString(), end_date: to.toISOString() };
}

export function GalleryFilters() {
    const state = useOverlayTriggerState({});
    const { updateQuery } = useUpdateQuery();
    const search = useSearch({ strict: false }) as Record<string, unknown>;
    const [draft, setDraft] = useState<Filters>(() => parseFilters(search));
    const location = useLocation();
    const show = location.pathname.startsWith("/admin/gallery");

    const { data: categories = [] } = useCategories();

    useEffect(() => {
        setDraft(parseFilters(search));
    }, [search.sort, search.active, search.inventory, search.category_slug, search.name, search.start_date, search.end_date]);

    function handleApply() {
        updateQuery([
            { key: "sort", value: draft.sort === DEFAULTS.sort ? "" : draft.sort },
            { key: "active", value: draft.active === DEFAULTS.active ? "" : draft.active },
            { key: "inventory", value: draft.inventory === DEFAULTS.inventory ? "" : draft.inventory },
            { key: "category_slug", value: draft.category_slug == "_all_" ? "" : draft.category_slug },
            { key: "name", value: draft.name },
            { key: "start_date", value: draft.start_date },
            { key: "end_date", value: draft.end_date },
        ]);
        state.close()
    }

    function handleReset() {
        setDraft(DEFAULTS);
        updateQuery([
            { key: "sort", value: "" },
            { key: "active", value: "" },
            { key: "inventory", value: "" },
            { key: "category_slug", value: "" },
            { key: "name", value: "" },
            { key: "start_date", value: "" },
            { key: "end_date", value: "" },
        ]);
        state.close()
    }

    const applied = parseFilters(search);
    const activeCount = countActiveFilters(applied);
    const isDirty =
        draft.sort !== applied.sort ||
        draft.active !== applied.active ||
        draft.inventory !== applied.inventory ||
        draft.category_slug !== applied.category_slug ||
        draft.name !== applied.name ||
        draft.start_date !== applied.start_date ||
        draft.end_date !== applied.end_date;

    if (!show) return null;

    return (
        <SheetDrawer
            open={state.isOpen}
            sheetClassName="min-w-[30vw]"
            title={
                <div className="flex items-center justify-between px-3 py-0 md:py-4 w-full">
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
            }
            trigger={
                <Button variant="outline" size="sm" className="relative gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-2xs font-medium text-background">
                            {activeCount}
                        </span>
                    )}
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <div>
                <Separator />
                <div className="space-y-5 p-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Product name
                        </Label>
                        <Input
                            placeholder="Search by name..."
                            value={draft.name}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                            className="h-10 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Categories
                        </Label>
                        <Select
                            value={draft.category_slug == "" ? "_all_" : draft.category_slug}
                            onValueChange={(value) => (
                                setDraft((d) => ({
                                    ...d,
                                    category_slug: d.category_slug === value ? "" : value,
                                }))
                            )}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="_all_">
                                        All categories
                                    </SelectItem>
                                    {categories.map((item: Category) => (
                                        <SelectItem key={item.slug} value={item.name}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {draft.category_slug && (
                            <button
                                onClick={() => setDraft((d) => ({ ...d, category_slug: "" }))}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                                Clear category
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Upload date
                        </Label>
                        <div className="grid grid-cols-4 gap-1">
                            {[
                                { days: 0, label: "Today" },
                                { days: 7, label: "7d" },
                                { days: 14, label: "14d" },
                                { days: 30, label: "30d" },
                            ].map(({ days, label }) => (
                                <Button
                                    key={days}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-0 text-xs"
                                    onClick={() => setDraft((d) => ({ ...d, ...applyDatePreset(days) }))}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <DateRangePicker
                            placeholder="Custom range..."
                            value={
                                draft.start_date
                                    ? {
                                        from: new Date(draft.start_date),
                                        to: draft.end_date ? new Date(draft.end_date) : undefined,
                                    }
                                    : undefined
                            }
                            onChange={(range) => {
                                if (range?.from && range?.to) {
                                    setDraft((d) => ({
                                        ...d,
                                        start_date: range.from!.toISOString(),
                                        end_date: range.to!.toISOString(),
                                    }));
                                }
                            }}
                        />
                        {draft.start_date && (
                            <button
                                onClick={() => setDraft((d) => ({ ...d, start_date: "", end_date: "" }))}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                                Clear date
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort by</Label>
                        <ToggleGroup
                            type="single"
                            value={draft.sort}
                            onValueChange={(val) => val && setDraft((d) => ({ ...d, sort: val as Filters["sort"] }))}
                            className="grid grid-cols-2 gap-1.5"
                        >
                            {[{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }].map(({ value, label }) => (
                                <ToggleGroupItem value={value} className="h-8 text-xs bg-secondary data-[state=on]:bg-foreground data-[state=on]:text-background">
                                    {label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</Label>
                        <ToggleGroup
                            type="single"
                            value={draft.active}
                            onValueChange={(val) => val && setDraft((d) => ({ ...d, active: val as Filters["active"] }))}
                            className="grid grid-cols-3 gap-1.5"
                        >
                            {[{ value: "all", label: "All" }, { value: "true", label: "In store" }, { value: "false", label: "Out store" }].map(({ value, label }) => (
                                <ToggleGroupItem value={value} className="h-8 text-xs bg-secondary data-[state=on]:bg-foreground data-[state=on]:text-background">
                                    {label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inventory</Label>
                        <ToggleGroup
                            type="single"
                            value={draft.inventory}
                            onValueChange={(val) => val && setDraft((d) => ({ ...d, inventory: val as Filters["inventory"] }))}
                            className="grid grid-cols-3 gap-1.5"
                        >
                            {[
                                { value: "all", label: "All" },
                                { value: "out_of_stock", label: "Out of stock" },
                                { value: "in_stock", label: "In stock" }
                            ].map(({ value, label }) => (
                                <ToggleGroupItem value={value} className="h-8 text-xs bg-secondary data-[state=on]:bg-foreground data-[state=on]:text-background">
                                    {label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                </div>

                <Separator />

                <div className="flex gap-2 px-4 py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            setDraft(parseFilters(search));
                            state.close();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleApply} disabled={!isDirty}>
                        Apply
                    </Button>
                </div>
            </div>
        </SheetDrawer >
    )
}
