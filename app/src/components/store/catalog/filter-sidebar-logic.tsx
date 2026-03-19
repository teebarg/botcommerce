import { useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
import type { Facet } from "@/schemas/product";
import { currency, debounce } from "@/utils";
import { AGE_OPTIONS, COLOR_OPTIONS, type ColorOption, SIZE_OPTIONS } from "@/utils/constants";

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
    sort: "id:desc",
    sizes: new Set<string>(),
    colors: new Set<string>(),
    ages: new Set<string>(),
    categories: new Set<string>(),
    minPrice: "1000",
    maxPrice: "50000",
};

const PRICE_MIN_BOUND = 1;
const PRICE_MAX_BOUND = 1_000_000;

const normalizePriceValues = (minStr: string, maxStr: string) => {
    const parse = (v: string): number | null => {
        if (!v) return null;
        const parsed = Number(v);
        if (!Number.isFinite(parsed)) return null;
        return Math.trunc(parsed);
    };

    const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

    const minParsed = parse(minStr);
    const maxParsed = parse(maxStr);

    const minNormalized = minParsed == null ? "" : clamp(minParsed, PRICE_MIN_BOUND, PRICE_MAX_BOUND).toString();
    const maxNormalized = maxParsed == null ? "" : clamp(maxParsed, PRICE_MIN_BOUND, PRICE_MAX_BOUND).toString();

    if (minNormalized !== "" && maxNormalized !== "") {
        const minNum = Number(minNormalized);
        let maxNum = Number(maxNormalized);
        if (maxNum < minNum) maxNum = minNum; // enforce max >= min

        return { minPrice: minNum.toString(), maxPrice: maxNum.toString() };
    }

    return { minPrice: minNormalized, maxPrice: maxNormalized };
};

export const FilterSidebarLogic = forwardRef<FilterSidebarRef, Props>(({ facets, onClose }, ref) => {
    const search = useSearch({ strict: false });
    const filters = useMemo(() => {
        return {
            sort: search.sort ?? "id:desc",
            sizes: new Set(search.sizes?.toString()?.split(",").filter(Boolean)),
            colors: new Set(search.colors?.split(",").filter(Boolean)),
            ages: new Set(search.ages?.split(",").filter(Boolean)),
            categories: new Set(search.cat_ids?.split(",").filter(Boolean)),
            minPrice: search.min_price?.toString() ?? "1",
            maxPrice: search.max_price?.toString() ?? "50000",
        };
    }, [search]);

    const [draft, setDraft] = useState(filters);
    const { updateQuery } = useUpdateQuery();
    const { data: categories } = useCategories();
    const { data: collections } = useCollections();
    const navigate = useNavigate();

    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        sort: true,
        size: true,
        color: true,
        age: true,
    });

    const [sort, setSort] = useState(() => search?.sort || "id:desc");

    const [priceMinInput, setPriceMinInput] = useState<string>(filters.minPrice);
    const [priceMaxInput, setPriceMaxInput] = useState<string>(filters.maxPrice);

    const priceLowId = useId();
    const priceHighId = useId();
    const priceNewestId = useId();

    useEffect(() => {
        // Keep the input fields in sync if the underlying search params change
        setPriceMinInput(filters.minPrice);
        setPriceMaxInput(filters.maxPrice);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.minPrice, filters.maxPrice]);

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

    const debouncedNormalizeRef = useMemo(
        () =>
            debounce((minStr: string, maxStr: string) => {
                const { minPrice, maxPrice } = normalizePriceValues(minStr, maxStr);
                setDraft((prev) => ({ ...prev, minPrice, maxPrice }));
                setPriceMinInput(minPrice);
                setPriceMaxInput(maxPrice);
            }, 300),
        []
    );

    const handlePriceMinChange = (next: string) => {
        const cleaned = next === "" ? "" : next.replace(/[^\d]/g, "");
        setPriceMinInput(cleaned);
        debouncedNormalizeRef(cleaned, priceMaxInput);
    };

    const handlePriceMaxChange = (next: string) => {
        const cleaned = next === "" ? "" : next.replace(/[^\d]/g, "");
        setPriceMaxInput(cleaned);
        debouncedNormalizeRef(priceMinInput, cleaned);
    };

    const apply = () => {
        const { minPrice, maxPrice } = normalizePriceValues(priceMinInput, priceMaxInput);
        updateQuery([
            { key: "sort", value: draft.sort },
            { key: "sizes", value: [...draft.sizes].join(",") },
            { key: "colors", value: [...draft.colors].join(",") },
            { key: "ages", value: [...draft.ages].join(",") },
            { key: "cat_ids", value: [...draft.categories].join(",") },
            { key: "min_price", value: minPrice },
            { key: "max_price", value: maxPrice },
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
        setPriceMinInput(DEFAULT_DRAFT.minPrice);
        setPriceMaxInput(DEFAULT_DRAFT.maxPrice);
    };

    useImperativeHandle(ref, () => ({
        apply,
        clear,
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {collections?.map((collection) => (
                    <Badge
                        key={collection.id}
                        className="cursor-pointer py-1 text-sm"
                        onClick={() => {
                            navigate({ to: `/collections/${collection.slug}` });
                            onClose?.();
                        }}
                    >
                        {collection.name}
                    </Badge>
                ))}
            </div>
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
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <Input
                                        label="Min"
                                        inputMode="numeric"
                                        placeholder="1"
                                        min={PRICE_MIN_BOUND}
                                        max={PRICE_MAX_BOUND}
                                        step={1}
                                        type="text"
                                        value={priceMinInput}
                                        onChange={(e) => handlePriceMinChange(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        label="Max"
                                        inputMode="numeric"
                                        placeholder={`${PRICE_MAX_BOUND.toLocaleString()}`}
                                        min={PRICE_MIN_BOUND}
                                        max={PRICE_MAX_BOUND}
                                        step={1}
                                        type="text"
                                        value={priceMaxInput}
                                        onChange={(e) => handlePriceMaxChange(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{draft.minPrice ? currency(Number(draft.minPrice)) : "Any"}</span>
                                <span>{draft.maxPrice ? currency(Number(draft.maxPrice)) : "Any"}</span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Min must be at least {PRICE_MIN_BOUND}. Max must be at most {PRICE_MAX_BOUND.toLocaleString()}. Max must be greater
                                than or equal to Min.
                            </p>
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
                                <RadioGroupItem id={priceLowId} value="min_variant_price:asc" />
                                <Label className="text-sm" htmlFor={priceLowId}>
                                    Price: Low to High
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id={priceHighId} value="min_variant_price:desc" />
                                <Label className="text-sm" htmlFor={priceHighId}>
                                    Price: High to Low
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id={priceNewestId} value="id:desc" />
                                <Label className="text-sm" htmlFor={priceNewestId}>
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
