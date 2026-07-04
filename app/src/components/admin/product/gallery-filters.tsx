"use client";

import { useLocation, useSearch } from "@tanstack/react-router";
import { Calendar, Check, ChevronsUpDown, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/schemas";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/utils";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";

type Filters = {
    sort: "newest" | "oldest";
    active: "true" | "false" | "all";
    out_of_stock: boolean;
    category_slug: string;
    name: string;
    start_date: string;
    end_date: string;
};

const DEFAULTS: Filters = {
    sort: "newest",
    active: "all",
    out_of_stock: false,
    category_slug: "",
    name: "",
    start_date: "",
    end_date: "",
};

function parseFilters(search: Record<string, unknown>): Filters {
    return {
        sort: search.sort === "oldest" ? "oldest" : "newest",
        active: search.active == true ? "true" : search.active == false ? "false" : "all",
        out_of_stock: search.out_of_stock ? true : false,
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
    if (filters.out_of_stock !== DEFAULTS.out_of_stock) count++;
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
    const { updateQuery } = useUpdateQuery();
    const search = useSearch({ strict: false }) as Record<string, unknown>;
    const [open, setOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [draft, setDraft] = useState<Filters>(() => parseFilters(search));
    const location = useLocation();
    const show = location.pathname.startsWith("/admin/gallery");

    const { data: categories = [] } = useCategories();

    useEffect(() => {
        setDraft(parseFilters(search));
    }, [search.sort, search.active, search.out_of_stock, search.category_slug, search.name, search.start_date, search.end_date]);

    function handleApply() {
        updateQuery([
            { key: "sort", value: draft.sort === DEFAULTS.sort ? "" : draft.sort },
            { key: "active", value: draft.active === DEFAULTS.active ? "" : draft.active },
            { key: "out_of_stock", value: draft.out_of_stock ? true : "" },
            { key: "category_slug", value: draft.category_slug },
            { key: "name", value: draft.name },
            { key: "start_date", value: draft.start_date },
            { key: "end_date", value: draft.end_date },
        ]);
        setOpen(false);
    }

    function handleReset() {
        setDraft(DEFAULTS);
        updateQuery([
            { key: "sort", value: "" },
            { key: "active", value: "" },
            { key: "out_of_stock", value: "" },
            { key: "category_slug", value: "" },
            { key: "name", value: "" },
            { key: "start_date", value: "" },
            { key: "end_date", value: "" },
        ]);
        setOpen(false);
    }

    const applied = parseFilters(search);
    const activeCount = countActiveFilters(applied);
    const isDirty =
        draft.sort !== applied.sort ||
        draft.active !== applied.active ||
        draft.out_of_stock !== applied.out_of_stock ||
        draft.category_slug !== applied.category_slug ||
        draft.name !== applied.name ||
        draft.start_date !== applied.start_date ||
        draft.end_date !== applied.end_date;

    const selectedCategory = categories.find((c: Category) => c.slug === draft.category_slug);

    if (!show) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-2xs font-medium text-background">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-96 p-0">
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

                <div className="space-y-5 p-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Product name
                        </Label>
                        <Input
                            placeholder="Search by name..."
                            value={draft.name}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                            className="h-8 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Category
                        </Label>
                        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={categoryOpen}
                                    className="w-full h-8 justify-between text-sm font-normal"
                                >
                                    <span className={cn(!selectedCategory && "text-muted-foreground")}>
                                        {selectedCategory ? selectedCategory.name : "All categories"}
                                    </span>
                                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search categories..." className="h-8 text-sm" />
                                    <CommandList>
                                        <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                                            No categories found
                                        </CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="__all__"
                                                onSelect={() => {
                                                    setDraft((d) => ({ ...d, category_slug: "" }));
                                                    setCategoryOpen(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-3.5 w-3.5", !draft.category_slug ? "opacity-100" : "opacity-0")} />
                                                All categories
                                            </CommandItem>
                                            {categories.map((cat: Category) => (
                                                <CommandItem
                                                    key={cat.slug}
                                                    value={cat.name}
                                                    onSelect={() => {
                                                        setDraft((d) => ({
                                                            ...d,
                                                            category_slug: d.category_slug === cat.slug ? "" : cat.slug,
                                                        }));
                                                        setCategoryOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-3.5 w-3.5", draft.category_slug === cat.slug ? "opacity-100" : "opacity-0")} />
                                                    {cat.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
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
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
                            <DateRangePicker
                                className="[&_button]:h-8 [&_button]:pl-8 [&_button]:text-xs"
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
                        </div>
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

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Out of stock</Label>
                            <p className="text-xs text-muted-foreground">Show only sold out items</p>
                        </div>
                        <Switch
                            checked={draft.out_of_stock}
                            onCheckedChange={(val) => setDraft((d) => ({ ...d, out_of_stock: val }))}
                        />
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
