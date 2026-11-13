import { useMemo, useState } from "react";
import type { Product, ProductOption, ProductSearch, ProductVariant } from "@/schemas";
import { cn } from "@/utils/cn";
import { productOptions, variantAttributes } from "@/lib/variant";

type Selection = Record<string, string>;

const matchesSelection = (variant: ProductVariant, selected: Selection, optionNames: string[], except?: string) => {
    const attributes = variantAttributes(variant);
    return Object.entries(selected).every(([name, value]) => !optionNames.includes(name) || name === except || attributes[name] === value);
};

// Shared by the product page and the product card sheet so both behave the same.
export function useVariantSelection(product: Product | ProductSearch, initial?: ProductVariant | null) {
    const options = useMemo(() => productOptions(product), [product]);
    const variants = useMemo(() => product.variants ?? [], [product]);
    const [selected, setSelected] = useState<Selection>(() => (initial ? variantAttributes(initial) : {}));

    const selectedVariant = useMemo(() => {
        if (!options.length) return initial ?? variants.find((variant) => variant.inventory > 0) ?? variants[0] ?? null;
        return (
            variants.find((variant) => {
                const attributes = variantAttributes(variant);
                return options.every((option) => selected[option.name] && attributes[option.name] === selected[option.name]);
            }) ?? null
        );
    }, [initial, options, selected, variants]);

    const missing = options.filter((option) => !selected[option.name]).map((option) => option.name);
    const select = (name: string, value: string) => setSelected((previous) => ({ ...previous, [name]: value }));

    return { options, variants, selected, select, selectedVariant, missing };
}

// Colour choices that are valid CSS colours ("Red", "#222") get a small dot.
const swatchColor = (name: string, value: string) =>
    typeof CSS !== "undefined" && /colou?r/i.test(name) && CSS.supports("color", value.trim()) ? value.trim() : null;

interface VariantPickerProps {
    options: ProductOption[];
    variants: ProductVariant[];
    selected: Selection;
    onSelect: (name: string, value: string) => void;
}

export function VariantPicker({ options, variants, selected, onSelect }: VariantPickerProps) {
    const optionNames = options.map((option) => option.name);
    if (!options.length || options.length < 1) return null;

    return (
        <div className="space-y-5">
            {options.map((option) => (
                <div key={option.name} role="group" aria-label={option.name} className="space-y-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">{option.name}</p>
                        <span className="text-xs text-muted-foreground">{selected[option.name] ?? `Select ${option.name.toLowerCase()}`}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                            const available = variants.some(
                                (variant) =>
                                    variant.inventory > 0 &&
                                    variantAttributes(variant)[option.name] === value &&
                                    matchesSelection(variant, selected, optionNames, option.name),
                            );
                            const isSelected = selected[option.name] === value;
                            const swatch = swatchColor(option.name, value);

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    disabled={!available}
                                    onClick={() => onSelect(option.name, value)}
                                    aria-pressed={isSelected}
                                    title={available ? undefined : "Out of stock"}
                                    className={cn(
                                        "inline-flex min-h-10 min-w-12 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-all duration-150",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 motion-safe:active:scale-95",
                                        isSelected ? "border-foreground bg-foreground text-background shadow-sm" : "border-border bg-background hover:border-foreground",
                                        !available && "cursor-not-allowed opacity-40 line-through",
                                    )}
                                >
                                    {swatch && <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: swatch }} />}
                                    {value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
