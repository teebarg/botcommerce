import { useSearch } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, MessageCircle } from "lucide-react";
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCategories } from "@/hooks/useCategories";
import { useCollections } from "@/hooks/useCollection";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { currency, debounce } from "@/utils";
import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from "@/utils/constants";
import { cn } from "@/utils/cn";
import { useFeedUi } from "@/hooks/useFeedUi";
import { productFeedInfiniteQuery } from "@/queries/user.queries";
import type { FeedQuery } from "@/schemas";

export interface FilterSidebarRef {
    apply: () => void;
    clear: () => void;
}

interface Props {
    onClose?: () => void;
}

type AvailableFilter = {
    name: string;
    values: { value: string; count: number }[];
};

const EMPTY_AVAILABLE_FILTERS: AvailableFilter[] = [];

type DraftFilters = {
    attributes: Record<string, Set<string>>;
    categories: Set<string>;
    collections: Set<string>;
    sort: "min_price:asc" | "min_price:desc" | "id:desc" | "";
    minPrice: string;
    maxPrice: string;
};

const PRICE_MIN_BOUND = DEFAULT_MIN_PRICE;
const PRICE_MAX_BOUND = DEFAULT_MAX_PRICE;

const normalizePriceValues = (minStr: string, maxStr: string) => {
    const parse = (value: string): number | null => {
        if (!value) return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
    };
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    const min = parse(minStr);
    const max = parse(maxStr);
    const minPrice = min == null ? "" : String(clamp(min, PRICE_MIN_BOUND, PRICE_MAX_BOUND));
    let maxPrice = max == null ? "" : String(clamp(max, PRICE_MIN_BOUND, PRICE_MAX_BOUND));
    if (minPrice && maxPrice && Number(maxPrice) < Number(minPrice)) maxPrice = minPrice;
    return { minPrice, maxPrice };
};

const parseAttributeFilters = (value?: string): Record<string, Set<string>> => {
    if (!value) return {};
    try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        return Object.fromEntries(
            Object.entries(parsed)
                .filter(([, values]) => Array.isArray(values))
                .map(([name, values]) => [name, new Set((values as unknown[]).map(String))])
        );
    } catch {
        return {};
    }
};

const getLegacyAttributeDraft = (
    availableFilters: AvailableFilter[],
    search: Record<string, unknown>,
): Record<string, Set<string>> => {
    const result = parseAttributeFilters(typeof search.attribute_filters === "string" ? search.attribute_filters : undefined);
    const legacy = [
        { params: "sizes", names: ["size"] },
        { params: "ages", names: ["age"] },
        { params: "width", names: ["width", "waist"] },
        { params: "length", names: ["length"] },
    ];

    for (const item of legacy) {
        const raw = search[item.params] == null ? "" : String(search[item.params]);
        const values = raw.split(",").map((value) => value.trim()).filter(Boolean);
        if (!values.length) continue;
        const matchingNames = availableFilters
            .filter((filter) => item.names.includes(filter.name.trim().toLocaleLowerCase()))
            .map((filter) => filter.name);
        const names = matchingNames.length ? matchingNames : [item.names[0][0].toUpperCase() + item.names[0].slice(1)];
        for (const name of names) {
            result[name] = new Set([...(result[name] ?? []), ...values]);
        }
    }
    return result;
};

const getColorValue = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const colors: Record<string, string> = {
        black: "#171717", white: "#ffffff", red: "#dc2626", blue: "#2563eb", navy: "#1e3a8a",
        green: "#16a34a", yellow: "#eab308", orange: "#ea580c", pink: "#ec4899", purple: "#9333ea",
        brown: "#92400e", grey: "#9ca3af", gray: "#9ca3af", cream: "#f5f0dc", beige: "#d6c2a1",
    };
    return colors[normalized] ?? (normalized.startsWith("#") ? normalized : undefined);
};

export const FilterSidebarLogic = forwardRef<FilterSidebarRef, Props>(({ onClose }, ref) => {
    const search = useSearch({ strict: false }) as Record<string, unknown>;
    const { quick, setQuick } = useFeedUi();
    const { updateQuery } = useUpdateQuery();
    const { data: categories } = useCategories();
    const { data: collections } = useCollections();
    const feedQuery = useMemo(() => ({ ...search }) as FeedQuery, [search]);
    const { data: feedData } = useInfiniteQuery(productFeedInfiniteQuery(feedQuery));
    const availableFilters = feedData?.pages?.[0]?.available_filters ?? EMPTY_AVAILABLE_FILTERS;

    const filters = useMemo<DraftFilters>(() => ({
        sort: (search.sort as DraftFilters["sort"]) || "",
        attributes: getLegacyAttributeDraft(availableFilters, search),
        categories: new Set(typeof search.cat_ids === "string" ? search.cat_ids.split(",").filter(Boolean) : []),
        collections: new Set(typeof search.collections === "string" ? search.collections.split(",").filter(Boolean) : []),
        minPrice: search.min_price?.toString() ?? `${DEFAULT_MIN_PRICE}`,
        maxPrice: search.max_price?.toString() ?? `${DEFAULT_MAX_PRICE}`,
    }), [search, availableFilters]);

    const [draft, setDraft] = useState<DraftFilters>(filters);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        categories: true, price: true, sort: true,
    });
    const [priceMinInput, setPriceMinInput] = useState(filters.minPrice);
    const [priceMaxInput, setPriceMaxInput] = useState(filters.maxPrice);
    const priceLowId = useId();
    const priceHighId = useId();
    const priceNewestId = useId();

    useEffect(() => {
        setDraft(filters);
        setPriceMinInput(filters.minPrice);
        setPriceMaxInput(filters.maxPrice);
    }, [filters]);

    const toggleSection = (section: string) => {
        setOpenSections((previous) => ({ ...previous, [section]: !(previous[section] ?? true) }));
    };

    const toggleAttribute = (name: string, value: string) => {
        setDraft((previous) => {
            const next = new Set(previous.attributes[name] ?? []);
            next.has(value) ? next.delete(value) : next.add(value);
            const attributes = { ...previous.attributes };
            if (next.size) attributes[name] = next;
            else delete attributes[name];
            return { ...previous, attributes };
        });
    };

    const toggleSet = (key: "categories" | "collections", value: string) => {
        setDraft((previous) => {
            const next = new Set(previous[key]);
            next.has(value) ? next.delete(value) : next.add(value);
            return { ...previous, [key]: next };
        });
    };

    const debouncedNormalize = useMemo(() => debounce((min: string, max: string) => {
        const normalized = normalizePriceValues(min, max);
        setDraft((previous) => ({ ...previous, ...normalized }));
        setPriceMinInput(normalized.minPrice);
        setPriceMaxInput(normalized.maxPrice);
    }, 300), []);

    const handlePriceChange = (which: "min" | "max", value: string) => {
        const cleaned = value.replace(/[^\d]/g, "");
        if (which === "min") setPriceMinInput(cleaned);
        else setPriceMaxInput(cleaned);
        debouncedNormalize(which === "min" ? cleaned : priceMinInput, which === "max" ? cleaned : priceMaxInput);
    };

    const apply = () => {
        const price = normalizePriceValues(priceMinInput, priceMaxInput);
        const attributes = Object.fromEntries(
            Object.entries(draft.attributes)
                .map(([name, values]) => [name, [...values]])
                .filter(([, values]) => (values as string[]).length > 0)
        );
        updateQuery([
            { key: "sort", value: draft.sort },
            { key: "attribute_filters", value: Object.keys(attributes).length ? JSON.stringify(attributes) : "" },
            // Keep legacy parameters readable by older links/consumers; dynamic selections
            // are now represented by attribute_filters.
            { key: "sizes", value: "" }, { key: "ages", value: "" },
            { key: "width", value: "" }, { key: "length", value: "" },
            { key: "cat_ids", value: [...draft.categories].join(",") },
            { key: "collections", value: [...draft.collections].join(",") },
            { key: "min_price", value: price.minPrice },
            { key: "max_price", value: price.maxPrice },
        ]);
        onClose?.();
    };

    const clear = () => {
        setDraft({
            sort: "", attributes: {}, categories: new Set(), collections: new Set(),
            minPrice: String(DEFAULT_MIN_PRICE), maxPrice: String(DEFAULT_MAX_PRICE),
        });
        setPriceMinInput(String(DEFAULT_MIN_PRICE));
        setPriceMaxInput(String(DEFAULT_MAX_PRICE));
    };

    useImperativeHandle(ref, () => ({ apply, clear }));

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => setQuick(!quick)}
                aria-pressed={quick}
                className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", quick ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}
            >
                <MessageCircle className="h-4 w-4" />
                {quick ? "Quick order: on" : "Order via WhatsApp"}
            </button>

            <div className="flex flex-wrap gap-2">
                {collections?.map((collection) => (
                    <Badge key={collection.id} className={`cursor-pointer py-1 text-sm transition-colors ${draft.collections.has(collection.slug) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-muted"}`} onClick={() => toggleSet("collections", collection.slug)}>
                        {collection.name}
                    </Badge>
                ))}
            </div>

            <Collapsible open={openSections.categories ?? true} onOpenChange={() => toggleSection("categories")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Categories</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.categories ?? true ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="max-h-52 overflow-auto">
                    <div className="space-y-2 pt-2">
                        {categories?.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox id={`cat-${category.id}`} checked={draft.categories.has(category.slug)} onCheckedChange={() => toggleSet("categories", category.slug)} />
                                <Label htmlFor={`cat-${category.id}`} className="flex-1 cursor-pointer text-sm">{category.name}</Label>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSections.price ?? true} onOpenChange={() => toggleSection("price")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Price Range</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ?? true ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="space-y-3 px-1 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-1"><Input label="Min" inputMode="numeric" placeholder="1" value={priceMinInput} onChange={(event) => handlePriceChange("min", event.target.value)} /></div>
                            <div className="flex-1"><Input label="Max" inputMode="numeric" placeholder={PRICE_MAX_BOUND.toLocaleString()} value={priceMaxInput} onChange={(event) => handlePriceChange("max", event.target.value)} /></div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{draft.minPrice ? currency(Number(draft.minPrice)) : "Any"}</span>
                            <span>{draft.maxPrice ? currency(Number(draft.maxPrice)) : "Any"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Min must be at least {PRICE_MIN_BOUND}. Max must be at most {PRICE_MAX_BOUND.toLocaleString()}.</p>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSections.sort ?? true} onOpenChange={() => toggleSection("sort")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Sort By</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.sort ?? true ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="pt-2">
                        <RadioGroup value={draft.sort} onValueChange={(value) => setDraft((previous) => ({ ...previous, sort: value as DraftFilters["sort"] }))} className="gap-1">
                            <div className="flex items-center space-x-2"><RadioGroupItem id={priceLowId} value="min_price:asc" /><Label className="text-sm" htmlFor={priceLowId}>Price: Low to High</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem id={priceHighId} value="min_price:desc" /><Label className="text-sm" htmlFor={priceHighId}>Price: High to Low</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem id={priceNewestId} value="id:desc" /><Label className="text-sm" htmlFor={priceNewestId}>Newest</Label></div>
                        </RadioGroup>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {availableFilters.map((filter) => {
                const selected = draft.attributes[filter.name] ?? new Set<string>();
                const isColour = ["colour", "color"].includes(filter.name.trim().toLowerCase());
                const useChips = filter.values.length <= 12 && filter.name.trim().toLowerCase() !== "age group";
                const sectionKey = `attribute:${filter.name.toLocaleLowerCase()}`;
                const isOpen = openSections[sectionKey] ?? true;
                return (
                    <Collapsible key={filter.name.toLocaleLowerCase()} open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                            <span className="font-medium">{filter.name}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className={useChips ? "" : "max-h-52 overflow-auto"}>
                            {useChips ? (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {filter.values.map(({ value, count }) => {
                                        const color = isColour ? getColorValue(value) : undefined;
                                        const active = selected.has(value);
                                        return (
                                            <button key={value} type="button" aria-pressed={active} onClick={() => toggleAttribute(filter.name, value)} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted")}>
                                                {isColour && <span className="h-3 w-3 rounded-full border border-black/15" style={{ backgroundColor: color ?? "transparent" }} />}
                                                <span>{value}</span><span className={cn("text-[10px]", active ? "text-primary-foreground/75" : "text-muted-foreground")}>({count})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-2 pt-2">
                                    {filter.values.map(({ value, count }) => {
                                        const id = `attr-${sectionKey}-${value}`;
                                        return (
                                            <div key={value} className="flex items-center space-x-2">
                                                <Checkbox id={id} checked={selected.has(value)} onCheckedChange={() => toggleAttribute(filter.name, value)} />
                                                <Label htmlFor={id} className="flex flex-1 cursor-pointer items-center justify-between text-sm"><span>{value}</span><span className="text-xs text-muted-foreground">{count}</span></Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
});

FilterSidebarLogic.displayName = "FilterSidebarLogic";
