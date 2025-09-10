import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import { useSearchParams } from "next/navigation";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { cn } from "@/lib/utils";

export function FilterSidebar() {
    const [openSections, setOpenSections] = useState({
        sort: true,
        size: true,
        color: true,
    });
    const [dataSet, setDataSet] = useState(new Set());
    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery();

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const value = searchParams.get("sortBy") || "created_at:desc";

    const handleSortChange = (newValue: string) => {
        updateQuery([{ key: "sortBy", value: newValue }]);
    };

    const onSizeChange = (checked: boolean, slug: string) => {
        const newSet = new Set(dataSet);

        if (checked) {
            newSet.add(slug);
        } else {
            newSet.delete(slug);
        }

        setDataSet(newSet);
        updateQuery([{ key: "sizes", value: Array.from(newSet).join(",") }]);
    };

    useEffect(() => {
        const sizesFromURL = searchParams.get("sizes")?.split(",") || [];

        const newSet = new Set(sizesFromURL);

        setDataSet(newSet);
    }, [searchParams]);

    return (
        <div className="filter-sidebar p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-background">
                <h2 className="font-semibold text-lg">FILTER & SORT</h2>
                <Button variant="transparent" className="text-accent hover:text-accent-hover bg-background">
                    Clear All
                </Button>
            </div>

            <div className="mb-6">
                <Button
                    variant="default"
                    onClick={() => toggleSection("sort")}
                    className="justify-between w-full p-0 font-semibold mb-3 bg-transparent hover:bg-transparent"
                >
                    SORT BY
                    {openSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {openSections.sort && (
                    <RadioGroup value={value} onValueChange={handleSortChange} className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price-low" id="price-low" />
                            <Label htmlFor="price-low" className="text-sm">
                                Price: Low to High
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price-high" id="price-high" />
                            <Label htmlFor="price-high" className="text-sm">
                                Price: High to Low
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="newest" id="newest" />
                            <Label htmlFor="newest" className="text-sm">
                                Newest
                            </Label>
                        </div>
                    </RadioGroup>
                )}
            </div>

            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => toggleSection("size")}
                    className="justify-between w-full p-0 font-semibold mb-3"
                >
                    SIZE
                    {openSections.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {openSections.size && (
                    <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                        {SIZE_OPTIONS.map((size) => (
                            <Button
                                onClick={() => onSizeChange(true, size)}
                                key={size}
                                variant={dataSet.has(size) ? "indigo" : "outline"}
                                size="iconOnly"
                                className={cn(
                                    "h-12 text-lg bg-content2 hover:bg-primary hover:text-primary-foreground",
                                    dataSet.has(size) && "bg-indigo-500 text-white"
                                )}
                            >
                                {size}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => toggleSection("color")}
                    className="flex items-center justify-between w-full p-0 font-semibold mb-3"
                >
                    COLOR
                    {openSections.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {openSections.color && (
                    <div className="grid grid-cols-4 lg:grid-cols-3 gap-4">
                        {COLOR_OPTIONS.map((color) => (
                            <div key={color} className="flex flex-col items-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: color }} />
                                <Label htmlFor={color} className="text-xs text-center">
                                    {color}
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-center sticky bottom-0 px-4">
                <Button variant="indigo" className="w-full rounded-full py-6">
                    Apply
                </Button>
            </div>
        </div>
    );
}
