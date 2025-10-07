"use client";

import React, { useEffect } from "react";
import { MessageCircleMore } from "lucide-react";

import { ProductVariant } from "@/schemas";
import { cn, currency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { Product } from "@/schemas/product";

interface VariantSelectionProps {
    product: Product;
    selectedVariant?: ProductVariant;
    onVariantChange: (variant: ProductVariant | undefined) => void;
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, onVariantChange }) => {
    const {
        selectedColor,
        selectedSize,
        selectedMeasurement,
        quantity,
        selectedVariant,
        setQuantity,
        sizes,
        colors,
        measurements,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        toggleMeasurementSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        loading,
        outOfStock,
    } = useProductVariant(product);

    useEffect(() => {
        onVariantChange(selectedVariant);
    }, [selectedVariant]);

    return (
        <div className="space-y-6 mt-4">
            {sizes?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Size</h3>
                    <div className="flex flex-wrap gap-2">
                        {sizes?.map((size) => {
                            if (!size) {
                                return null;
                            }
                            const available = isOptionAvailable("size", size!);
                            const isSelected = selectedSize === size;

                            return (
                                <button
                                    key={size}
                                    className={cn(
                                        "px-6 py-2 text-sm font-medium border border-border rounded-md transition-all duration-200",
                                        isSelected
                                            ? "bg-teal-800 text-white"
                                            : available
                                              ? "bg-card"
                                              : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                    )}
                                    disabled={!available}
                                    onClick={() => available && toggleSizeSelect(size)}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {colors.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Color</h3>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => {
                            if (!color) {
                                return null;
                            }
                            const available = isOptionAvailable("color", color);
                            const isSelected = selectedColor === color;

                            return (
                                <button
                                    key={color}
                                    className={cn(
                                        "relative p-0.5 rounded-full border-2 transition-all duration-200",
                                        isSelected ? "border-teal-700" : available ? "" : "cursor-not-allowed opacity-60"
                                    )}
                                    disabled={!available}
                                    onClick={() => available && toggleColorSelect(color)}
                                >
                                    <div
                                        className={cn("w-10 h-10 rounded-full border border-border", !available && "opacity-50")}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                    />
                                    {!available && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-0.5 bg-card rotate-45" />
                                        </div>
                                    )}
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
                                            ? "bg-teal-800 text-white"
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

            <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-md">
                    <Button size="sm" variant="ghost" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        -
                    </Button>
                    <span className="px-4">{quantity}</span>
                    <Button size="sm" variant="ghost" onClick={() => setQuantity(quantity + 1)}>
                        +
                    </Button>
                </div>
            </div>

            {selectedVariant?.status === "OUT_OF_STOCK" ? (
                <Button className="mt-4 w-max px-16 py-6" disabled={true}>
                    Out of Stock
                </Button>
            ) : (
                <div className="flex items-center gap-4 mt-4">
                    <Button className="w-auto" disabled={loading || !selectedVariant || outOfStock} size="lg" onClick={handleAddToCart}>
                        {loading ? "Adding to cart..." : outOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                        className="gap-2 bg-[#075e54] hover:bg-[#128c7e] text-white w-auto"
                        disabled={loading || !selectedVariant || outOfStock}
                        size="lg"
                        onClick={handleWhatsAppPurchase}
                    >
                        <MessageCircleMore className="w-4 h-4" />
                        <span>Buy on WhatsApp</span>
                    </Button>
                </div>
            )}
        </div>
    );
};
