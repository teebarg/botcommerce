import { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COLOR_OPTIONS, SIZE_OPTIONS, AGE_OPTIONS } from "@/utils/constants";
import { cn } from "@/utils";
import RangeSlider from "@/components/ui/range-slider";
import type { Facet } from "@/schemas/product";
import { useSearch } from "@tanstack/react-router";

export interface FilterSidebarRef {
    apply: () => void;
    clear: () => void;
}

interface Props {
    facets?: Facet;
    onClose?: () => void;
}

type DraftFilters = {
    sizes: Set<string>;
    colors: Set<string>;
    ages: Set<string>;
    categories: Set<string>;
    sort: string;
    minPrice: string;
    maxPrice: string;
};

const DEFAULT_DRAFT = {
    sort: "created_at:desc",
    sizes: new Set<string>(),
    colors: new Set<string>(),
    ages: new Set<string>(),
    categories: new Set<string>(),
    minPrice: "1000",
    maxPrice: "50000",
};

export const FilterSidebarLogic = forwardRef<FilterSidebarRef, Props>(({ facets, onClose }, ref) => {
    const search = useSearch({ strict: false });
    const filters = useMemo(() => {
        return {
            sort: search.sort ?? "created_at:desc",
            sizes: new Set(search.sizes?.toString()?.split(",").filter(Boolean)),
            colors: new Set(search.colors?.split(",").filter(Boolean)),
            ages: new Set(search.ages?.split(",").filter(Boolean)),
            categories: new Set(search.cat_ids?.split(",").filter(Boolean)),
            minPrice: search.min_price?.toString() ?? "",
            maxPrice: search.max_price?.toString() ?? "",
        };
    }, [search]);

    const [draft, setDraft] = useState(filters);
    const { updateQuery } = useUpdateQuery();
    const { data: categories } = useCategories();

    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        sort: true,
        size: true,
        color: true,
        age: true,
    });

    const [sort, setSort] = useState(() => search?.sort || "created_at:desc");

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleDraftSet = (key: keyof DraftFilters) => (value: string) => {
        setDraft((prev) => {
            const next = new Set(prev[key]);

            next.has(value) ? next.delete(value) : next.add(value);

            return {
                ...prev,
                [key]: next,
            };
        });
    };

    const onToggleSize = toggleDraftSet("sizes");
    const onToggleColor = toggleDraftSet("colors");
    const onToggleAge = toggleDraftSet("ages");
    const onToggleCategory = toggleDraftSet("categories");

    const onPriceChange = (values: number[]) => {
        const [minPrice, maxPrice] = values;

        setDraft((prev) => ({
            ...prev,
            minPrice: minPrice.toString(),
            maxPrice: maxPrice.toString(),
        }));
    };

    const apply = () => {
        updateQuery([
            { key: "sort", value: draft.sort },
            { key: "sizes", value: [...draft.sizes].join(",") },
            { key: "colors", value: [...draft.colors].join(",") },
            { key: "ages", value: [...draft.ages].join(",") },
            { key: "cat_ids", value: [...draft.categories].join(",") },
            { key: "min_price", value: draft.minPrice },
            { key: "max_price", value: draft.maxPrice },
        ]);
        onClose?.();
    };

    const clear = () => {
        setDraft({
            sort: DEFAULT_DRAFT.sort,
            sizes: new Set(),
            colors: new Set(),
            ages: new Set(),
            categories: new Set(),
            minPrice: DEFAULT_DRAFT.minPrice,
            maxPrice: DEFAULT_DRAFT.maxPrice,
        });
    };

    useImperativeHandle(ref, () => ({
        apply,
        clear,
    }));

    return (
        <>
            <div className="mb-6">
                <Button
                    className="justify-between w-full p-0 font-semibold mb-3 hover:bg-transparent"
                    variant="ghost"
                    onClick={() => toggleSection("categories" as any)}
                >
                    CATEGORIES
                    {(openSections as any) && (openSections as any).categories ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>

                {(openSections as any).categories && (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-auto pr-1">
                        {categories?.map((cat) => {
                            const active = draft.categories.has(cat.slug);

                            return (
                                <Button
                                    key={cat.id}
                                    className={cn("justify-between bg-card h-12", active && "bg-primary hover:bg-primary/90 text-white")}
                                    size="sm"
                                    variant={active ? "default" : "outline"}
                                    onClick={() => onToggleCategory(cat.slug)}
                                >
                                    {cat.name}
                                    <span className={cn("", !facets && "hidden")}>({facets?.category_slugs?.[cat.slug] || 0})</span>
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <Button
                    className="justify-between w-full p-0 font-semibold mb-3 hover:bg-transparent"
                    variant="ghost"
                    onClick={() => toggleSection("price" as any)}
                >
                    PRICE RANGE
                    {(openSections as any) && (openSections as any).price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {(openSections as any).price && (
                    <RangeSlider
                        defaultValue={[Number(search.min_price ?? 1000), Number(search.max_price ?? 50000)]}
                        label="Price Range"
                        max={100000}
                        min={0}
                        step={500}
                        onChange={onPriceChange}
                    />
                )}
            </div>

            <div className="mb-6">
                <Button
                    className="justify-between w-full p-0 font-semibold mb-3 hover:bg-transparent"
                    variant="ghost"
                    onClick={() => toggleSection("sort")}
                >
                    SORT BY
                    {openSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {openSections.sort && (
                    <RadioGroup value={sort} onValueChange={setSort}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="price-low" value="min_variant_price:asc" />
                            <Label className="text-sm" htmlFor="price-low">
                                Price: Low to High
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="price-high" value="min_variant_price:desc" />
                            <Label className="text-sm" htmlFor="price-high">
                                Price: High to Low
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="newest" value="id:desc" />
                            <Label className="text-sm" htmlFor="newest">
                                Newest
                            </Label>
                        </div>
                    </RadioGroup>
                )}
            </div>

            <div className="mb-6">
                <Button
                    className="justify-between w-full p-0 font-semibold mb-3 hover:bg-transparent"
                    variant="ghost"
                    onClick={() => toggleSection("size")}
                >
                    SIZE
                    {openSections.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {openSections.size && (
                    <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                        {SIZE_OPTIONS.map((size) => {
                            const active = draft.sizes.has(size);

                            return (
                                <Button
                                    key={size}
                                    className={cn("h-12 text-base bg-card hover:bg-primary/90 hover:text-white", active && "bg-primary text-white")}
                                    size="sm"
                                    variant={active ? "default" : "outline"}
                                    onClick={() => onToggleSize(size)}
                                >
                                    UK {size}
                                    <span className={cn("ml-2", !facets && "hidden")}>({facets?.sizes?.[size] || 0})</span>
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <Button
                    className="justify-between w-full p-0 font-semibold mb-3 hover:bg-transparent"
                    variant="ghost"
                    onClick={() => toggleSection("color")}
                >
                    COLOR
                    {openSections.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {openSections.color && (
                    <div className="grid grid-cols-4 lg:grid-cols-3 gap-4">
                        {COLOR_OPTIONS.map((color) => {
                            const active = draft.colors.has(color);

                            return (
                                <button
                                    key={color}
                                    aria-pressed={active}
                                    className={cn(
                                        "flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity",
                                        active && "opacity-100"
                                    )}
                                    onClick={() => onToggleColor(color)}
                                >
                                    <div
                                        className={cn("w-8 h-8 rounded-full border border-border", active && "ring-2 ring-primary ring-offset-2")}
                                        style={{ backgroundColor: color }}
                                    />
                                    <Label className="text-center text-sm" htmlFor={color}>
                                        {color}
                                        <span className={cn("ml-0.5", !facets && "hidden")}>({facets?.colors?.[color] || 0})</span>
                                    </Label>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <button className="flex items-center justify-between w-full" onClick={() => setOpenSections((prev) => ({ ...prev, age: !prev.age }))}>
                    <h3 className="font-medium">Age Range</h3>
                    {openSections.age ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {openSections.age && (
                    <div className="grid grid-cols-2 gap-2">
                        {AGE_OPTIONS.map((age) => {
                            const active = draft.ages.has(age);

                            return (
                                <button
                                    key={age}
                                    aria-pressed={active}
                                    className={cn(
                                        "flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-md border",
                                        active && "bg-primary text-primary-foreground"
                                    )}
                                    onClick={() => onToggleAge(age)}
                                >
                                    <Label className="text-center text-sm" htmlFor={age}>
                                        {age}
                                        <span className={cn("ml-0.5", !facets && "hidden")}>({facets?.ages?.[age] || 0})</span>
                                    </Label>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
});

FilterSidebarLogic.displayName = "FilterSidebarLogic";
