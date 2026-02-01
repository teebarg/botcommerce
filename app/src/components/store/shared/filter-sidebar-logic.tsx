import { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { useCategories } from "@/hooks/useCategories";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COLOR_OPTIONS, SIZE_OPTIONS, AGE_OPTIONS, ColorOption } from "@/utils/constants";
import { currency } from "@/utils";
import type { Facet } from "@/schemas/product";
import { useSearch } from "@tanstack/react-router";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

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
            minPrice: search.min_price?.toString() ?? "0",
            maxPrice: search.max_price?.toString() ?? "50000",
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
        <div className="space-y-6">
            <Collapsible open={openSections.categories} onOpenChange={() => toggleSection("categories")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Categories</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.categories ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="max-h-52 overflow-auto">
                    <div className="space-y-2 pt-2">
                        {categories?.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`cat-${category.id}`}
                                    checked={draft.categories.has(category.slug)}
                                    onCheckedChange={() => onToggleCategory(category.slug)}
                                />
                                <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer flex-1">
                                    {category.name}
                                </Label>
                                <span className="text-xs text-muted-foreground">{facets?.category_slugs?.[category.slug] || 0}</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
            {/* Price Range */}
            <Collapsible open={openSections.price} onOpenChange={() => toggleSection("price")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Price Range</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="pt-4 px-1">
                        <Slider
                            value={[Number(draft.minPrice ?? 1000), Number(draft.maxPrice ?? 50000)]}
                            min={0}
                            max={50000}
                            step={500}
                            onValueChange={(value) => onPriceChange(value as [number, number])}
                            className="mb-4 mx-auto w-full max-w-sm"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{currency(Number(draft.minPrice))}</span>
                            <span>{currency(Number(draft.maxPrice))}</span>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSections.sort} onOpenChange={() => toggleSection("sort")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Sort By</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.sort ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="pt-2">
                        <RadioGroup value={sort} onValueChange={setSort} className="gap-1">
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
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSections.size} onOpenChange={() => toggleSection("size")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Sizes</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.size ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {SIZE_OPTIONS.map((size) => (
                            <motion.button
                                key={size}
                                onClick={() => onToggleSize(size)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    draft.sizes.has(size)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                                }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                {size}
                            </motion.button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openSections.color} onOpenChange={() => toggleSection("color")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Colors</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.color ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {COLOR_OPTIONS.map((color: ColorOption) => (
                            <motion.button
                                key={color.name}
                                onClick={() => onToggleColor(color.name)}
                                className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                                    draft.colors.has(color.name)
                                        ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "border-border hover:border-muted-foreground"
                                }`}
                                style={{ backgroundColor: color.value }}
                                whileTap={{ scale: 0.9 }}
                                title={color.name}
                            >
                                {color.name === "White" && <span className="absolute inset-0 rounded-full border border-border" />}
                            </motion.button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Age Groups */}
            <Collapsible open={openSections.age} onOpenChange={() => toggleSection("age")}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="font-medium">Age Group</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSections.age ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="max-h-48 overflow-auto">
                    <div className="space-y-2 pt-2">
                        {AGE_OPTIONS.map((age: string) => (
                            <div key={age} className="flex items-center space-x-2">
                                <Checkbox id={`age-${age}`} checked={draft.ages.has(age)} onCheckedChange={() => onToggleAge(age)} />
                                <Label htmlFor={`age-${age}`} className="text-sm cursor-pointer">
                                    {age}
                                </Label>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
});

FilterSidebarLogic.displayName = "FilterSidebarLogic";
