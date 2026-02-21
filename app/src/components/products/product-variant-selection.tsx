import type React from "react";
import { useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn, currency } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { useProductVariant } from "@/hooks/useProductVariant";
import type { Product, ProductVariantLite } from "@/schemas/product";
import { motion } from "framer-motion";

interface VariantSelectionProps {
    product: Product;
    selectedVariant?: ProductVariantLite;
    onVariantChange: (variant: ProductVariantLite | undefined) => void;
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, onVariantChange }) => {
    const {
        selectedColor,
        selectedSize,
        selectedMeasurement,
        selectedAge,
        quantity,
        selectedVariant,
        setQuantity,
        sizes,
        colors,
        measurements,
        ages,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        toggleMeasurementSelect,
        toggleAgeSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        loading,
        outOfStock,
    } = useProductVariant(product);
    const safeColors = colors.filter((c): c is string => typeof c === "string");

    useEffect(() => {
        onVariantChange(selectedVariant);
    }, [selectedVariant]);

    return (
        <div className="space-y-6 mt-4">
            {sizes?.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                    <p className="text-sm font-medium text-foreground mb-3">Select Size</p>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => isOptionAvailable("size", size!) && toggleSizeSelect(size)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedSize === size ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {safeColors.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
                    <h3 className="text-sm font-medium text-foreground mb-3">Color: {selectedColor}</h3>
                    <div className="flex gap-3">
                        {safeColors.map((color: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => isOptionAvailable("color", color) && toggleColorSelect(color)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                    selectedColor === color ? "border-primary scale-110" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color.toLowerCase() }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {ages?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Age Range</h3>
                    <div className="flex flex-wrap gap-2">
                        {ages?.map((age) => {
                            if (!age) {
                                return null;
                            }
                            const available = isOptionAvailable("age", age!);
                            const isSelected = selectedAge === age;

                            return (
                                <button
                                    key={age}
                                    className={cn(
                                        "px-6 py-2 text-sm font-medium border border-border rounded-md transition-all duration-200",
                                        isSelected
                                            ? "bg-contrast text-contrast-foreground"
                                            : available
                                              ? "bg-card"
                                              : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                    )}
                                    disabled={!available}
                                    onClick={() => available && toggleAgeSelect(age)}
                                >
                                    {age}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {measurements?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Measurement</h3>
                    <div className="flex flex-wrap gap-2">
                        {measurements?.map((measurement) => {
                            if (!measurement) {
                                return null;
                            }
                            const available = isOptionAvailable("measurement", measurement!);
                            const isSelected = selectedMeasurement === measurement;

                            return (
                                <button
                                    key={measurement}
                                    className={cn(
                                        "px-6 py-2 text-sm font-medium border border-border rounded-md transition-all duration-200",
                                        isSelected
                                            ? "bg-contrast text-contrast-foreground"
                                            : available
                                              ? "bg-card"
                                              : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                    )}
                                    disabled={!available}
                                    onClick={() => available && toggleMeasurementSelect(measurement)}
                                >
                                    {measurement}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedVariant && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium">Selected Variant</p>
                            <p className="text-xs text-muted-foreground">SKU: {selectedVariant.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold">{currency(selectedVariant.price)}</p>
                            {selectedVariant.old_price > 0 && (
                                <p className="text-sm text-muted-foreground line-through">{currency(selectedVariant.old_price)}</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <Badge variant={selectedVariant.status === "IN_STOCK" ? "emerald" : "destructive"}>
                            {selectedVariant.status === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                        </Badge>
                        <span className="text-xs text-gray-400">{selectedVariant.inventory} available</span>
                    </div>
                </div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-4">
                <p className="text-sm font-medium text-foreground">Quantity</p>
                <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 rounded-md hover:bg-background transition-colors">
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 rounded-md hover:bg-background transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
