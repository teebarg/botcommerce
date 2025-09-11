import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FilterSidebar() {
    const [openSections, setOpenSections] = useState({
        sort: true,
        size: true,
        color: false,
    });

    const [sort, setSort] = useState<string>("created_at:desc");
    const [sizeSet, setSizeSet] = useState<Set<string>>(new Set());
    const [colorSet, setColorSet] = useState<Set<string>>(new Set());

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

    const onClearAll = () => {
        setSort("created_at:desc");
        setSizeSet(new Set());
        setColorSet(new Set());
    };

    const onApply = () => {
        updateQuery([
            { key: "sortBy", value: sort || "created_at:desc" },
            { key: "sizes", value: Array.from(sizeSet).join(",") },
            { key: "colors", value: Array.from(colorSet).join(",") },
        ]);
    };

    return (
        <div className="p-6 h-full overflow-y-auto bg-content1">
            <div className="flex items-center justify-between mb-6 sticky top-0 z-10">
                <h2 className="font-semibold text-lg">FILTER & SORT</h2>
                <Button className="text-accent hover:text-accent-hover px-0 justify-end" variant="transparent" onClick={onClearAll}>
                    Clear All
                </Button>
            </div>

            <div className="mb-6">
                <Button
                    className="justify-between w-full p-0 font-semibold mb-3 bg-transparent hover:bg-transparent"
                    variant="default"
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
                            <RadioGroupItem id="newest" value="created_at:desc" />
                            <Label className="text-sm" htmlFor="newest">
                                Newest
                            </Label>
                        </div>
                    </RadioGroup>
                )}
            </div>

            <div className="mb-6">
                <Button className="justify-between w-full p-0 font-semibold mb-3" variant="transparent" onClick={() => toggleSection("size")}>
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
                                    className={cn(
                                        "h-12 text-base bg-content3 hover:bg-indigo-400 hover:text-white",
                                        active && "bg-indigo-500 text-white"
                                    )}
                                    size="iconOnly"
                                    variant={active ? "indigo" : "outline"}
                                    onClick={() => onToggleSize(size)}
                                >
                                    {size}
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <Button
                    className="flex items-center justify-between w-full p-0 font-semibold mb-3"
                    variant="transparent"
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
                                        "flex flex-col items-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity",
                                        active && "opacity-100"
                                    )}
                                    onClick={() => onToggleColor(color)}
                                >
                                    <div
                                        className={cn("w-8 h-8 rounded-full border border-border", active && "ring-2 ring-indigo-500 ring-offset-2")}
                                        style={{ backgroundColor: color }}
                                    />
                                    <Label className="text-xs text-center" htmlFor={color}>
                                        {color}
                                    </Label>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="flex justify-center sticky bottom-0 px-4">
                <Button className="w-full rounded-full py-6" variant="indigo" onClick={onApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
