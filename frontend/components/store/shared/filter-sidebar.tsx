import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";

import { useCategories } from "@/lib/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import RangeSlider from "@/components/ui/range-slider";
import { Facet } from "@/schemas/product";

interface Props {
    facets?: Facet;
}

export function FilterSidebar({ facets }: Props) {
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        sort: true,
        size: true,
        color: true,
    });
    const { data: categories } = useCategories();

    const [sort, setSort] = useState<string>("created_at:desc");
    const [sizeSet, setSizeSet] = useState<Set<string>>(new Set());
    const [colorSet, setColorSet] = useState<Set<string>>(new Set());
    const [categorySet, setCategorySet] = useState<Set<string>>(new Set());
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery();

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        setSort(searchParams.get("sortBy") || "created_at:desc");

        const sizesFromURL = searchParams.get("sizes")?.split(",").filter(Boolean) || [];

        setSizeSet(new Set(sizesFromURL));

        const colorsFromURL = searchParams.get("colors")?.split(",").filter(Boolean) || [];

        setColorSet(new Set(colorsFromURL));

        const catsFromURL = searchParams.get("cat_ids")?.split(",").filter(Boolean) || [];

        setCategorySet(new Set(catsFromURL));

        setMinPrice(searchParams.get("minPrice") || "");
        setMaxPrice(searchParams.get("maxPrice") || "");
    }, [searchParams]);

    const onToggleSize = (slug: string) => {
        const next = new Set(sizeSet);

        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        setSizeSet(next);
    };

    const onToggleColor = (color: string) => {
        const next = new Set(colorSet);

        if (next.has(color)) next.delete(color);
        else next.add(color);
        setColorSet(next);
    };

    const onToggleCategory = (slug: string) => {
        const next = new Set(categorySet);

        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        setCategorySet(next);
    };

    const onClearAll = () => {
        setSort("created_at:desc");
        setSizeSet(new Set());
        setColorSet(new Set());
        setCategorySet(new Set());
        setMinPrice("");
        setMaxPrice("");
    };

    const onPriceChange = (values: number[]) => {
        const [minPrice, maxPrice] = values;

        setMinPrice(minPrice.toString());
        setMaxPrice(maxPrice.toString());
    };

    const onApply = () => {
        updateQuery([
            { key: "sortBy", value: sort || "created_at:desc" },
            { key: "sizes", value: Array.from(sizeSet).join(",") },
            { key: "colors", value: Array.from(colorSet).join(",") },
            { key: "cat_ids", value: Array.from(categorySet).join(",") },
            { key: "minPrice", value: minPrice },
            { key: "maxPrice", value: maxPrice },
        ]);
    };

    return (
        <div className="px-6 h-full overflow-y-auto bg-secondary dark:bg-secondary/30 relative">
            <div className="flex items-center justify-between mb-4 sticky top-0 z-10 py-4 bg-secondary dark:bg-secondary/5">
                <h2 className="font-semibold text-lg">FILTER & SORT</h2>
                <Button className="text-primary px-0 justify-end hover:bg-transparent" variant="ghost" onClick={onClearAll}>
                    Clear All
                </Button>
            </div>

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
                            const active = categorySet.has(cat.slug);

                            return (
                                <Button
                                    key={cat.id}
                                    className={cn("justify-between bg-card h-12", active && "bg-primary hover:bg-primary/90 text-white")}
                                    size="sm"
                                    variant={active ? "primary" : "outline"}
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
                        defaultValue={[Number(searchParams?.get("minPrice") ?? 1000), Number(searchParams?.get("maxPrice") ?? 50000)]}
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
                            const active = sizeSet.has(size);

                            return (
                                <Button
                                    key={size}
                                    className={cn("h-12 text-base bg-card hover:bg-primary/90 hover:text-white", active && "bg-primary text-white")}
                                    size="sm"
                                    variant={active ? "primary" : "outline"}
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
                            const active = colorSet.has(color);

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
            <div className="flex justify-center sticky bottom-0 px-4 py-4 bg-secondary dark:bg-secondary/5">
                <Button className="w-full rounded-full py-6" onClick={onApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
