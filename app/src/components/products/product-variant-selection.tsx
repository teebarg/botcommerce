import type React from "react";
import { useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn, currency } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { useProductVariant } from "@/hooks/useProductVariant";
import type { ProductLite, ProductVariantLite } from "@/schemas/product";

interface VariantSelectionProps {
    product: ProductLite;
    selectedVariant?: ProductVariantLite;
    onVariantChange: (variant: ProductVariantLite | undefined) => void;
}


function OptionGroup({
    label,
    options,
    selected,
    isAvailable,
    onToggle,
}: {
    label: string;
    options: (number | string | undefined | null)[];
    selected: number | string | null;
    isAvailable: (value: number | string) => boolean | undefined;
    onToggle: (value: any) => void;
}) {
    return (
        <div>
            <p className="text-sm font-medium text-foreground mb-2.5">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    if (!opt) return null;
                    const available = isAvailable(opt);
                    const isSelected = selected === opt;

                    return (
                        <button
                            key={opt}
                            disabled={!available}
                            onClick={() => available && onToggle(opt)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                                isSelected
                                    ? "bg-foreground text-background border-foreground"
                                    : available
                                        ? "bg-background border-border hover:bg-muted"
                                        : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
                            )}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, onVariantChange }) => {
    const {
        selectedColor,
        selectedSize,
        selectedWidth,
        selectedLength,
        selectedAge,
        quantity,
        selectedVariant,
        setQuantity,
        sizes,
        colors,
        widths,
        lengths,
        ages,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        toggleWidthSelect,
        toggleLengthSelect,
        toggleAgeSelect,
    } = useProductVariant(product);
    const safeColors = colors.filter((c): c is string => typeof c === "string");

    useEffect(() => {
        onVariantChange(selectedVariant);
    }, [selectedVariant]);

    return (
        <div className="space-y-5">
            {sizes?.length > 0 && (
                <OptionGroup
                    label="Size"
                    options={sizes}
                    selected={selectedSize}
                    isAvailable={(v) => isOptionAvailable("size", v)}
                    onToggle={(v) => toggleSizeSelect(v.toString())}
                />
            )}

            {safeColors.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-foreground mb-2.5">Color: {selectedColor}</p>
                    <div className="flex gap-2.5">
                        {safeColors.map((color, idx) => (
                            <button
                                key={idx}
                                onClick={() => isOptionAvailable("color", color) && toggleColorSelect(color)}
                                className={cn(
                                    "w-9 h-9 rounded-full border-2",
                                    selectedColor === color ? "border-foreground" : "border-border"
                                )}
                                style={{ backgroundColor: color.toLowerCase() }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {ages?.length > 0 && (
                <OptionGroup
                    label="Age range"
                    options={ages}
                    selected={selectedAge}
                    isAvailable={(v) => isOptionAvailable("age", v)}
                    onToggle={toggleAgeSelect}
                />
            )}

            {widths?.length > 0 && (
                <OptionGroup
                    label="Waist"
                    options={widths}
                    selected={selectedWidth}
                    isAvailable={(v) => isOptionAvailable("width", v)}
                    onToggle={toggleWidthSelect}
                />
            )}

            {lengths?.length > 0 && (
                <OptionGroup
                    label="Length"
                    options={lengths}
                    selected={selectedLength}
                    isAvailable={(v) => isOptionAvailable("length", v)}
                    onToggle={toggleLengthSelect}
                />
            )}

            {selectedVariant && (
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium">Selected variant</p>
                            <p className="text-xs text-muted-foreground mt-0.5">SKU: {selectedVariant.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-semibold">{currency(selectedVariant.price)}</p>
                            {selectedVariant.old_price > 0 && (
                                <p className="text-xs text-muted-foreground line-through">{currency(selectedVariant.old_price)}</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <Badge variant={selectedVariant.status === "IN_STOCK" ? "success-subtle" : "destructive"}>
                            {selectedVariant.status === "IN_STOCK" ? "In stock" : "Out of stock"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{selectedVariant.inventory} available</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-foreground">Quantity</p>
                <div className="flex items-center gap-3 bg-secondary rounded-full p-1">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
