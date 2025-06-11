"use client";

import React, { useState } from "react";

import { Product, ProductVariant } from "@/types/models";

interface CompactVariantSelectionProps {
    product: Product;
    onVariantChange: (variant: ProductVariant) => void;
    showPrice?: boolean;
}

export const CompactVariantSelection: React.FC<CompactVariantSelectionProps> = ({ product, onVariantChange, showPrice = true }) => {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
        product.variants.find((v) => v.status === "IN_STOCK") || product.variants[0]
    );

    const colors = [...new Set(product.variants.filter((v) => v.color).map((v) => v.color))];
    const sizes = [...new Set(product.variants.filter((v) => v.size).map((v) => v.size))];

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        onVariantChange(variant);
    };

    const handleColorSelect = (color: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const variant = product.variants.find((v) => v.color === color && v.status === "IN_STOCK");

        if (variant) {
            handleVariantSelect(variant);
        }
    };

    return (
        <div className="space-y-2">
            {/* Color swatches - only show if there are colors */}
            {colors.length > 0 && (
                <div className="flex gap-1">
                    {colors.slice(0, 5).map((color) => {
                        const variant = product.variants.find((v) => v.color === color);
                        const isSelected = selectedVariant?.color === color;
                        const isAvailable = variant?.status === "IN_STOCK" && (variant?.inventory || 0) > 0;

                        return (
                            <button
                                key={color}
                                className={`
                  relative w-6 h-6 rounded-full border transition-all duration-200
                  ${isSelected ? "border-2 border-black shadow-sm" : "border border-gray-300 hover:border-gray-400"}
                  ${!isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1
                `}
                                disabled={!isAvailable}
                                style={{ backgroundColor: color.toLowerCase() }}
                                onClick={(e) => isAvailable && handleColorSelect(color, e)}
                            >
                                {!isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-0.5 bg-gray-400 rotate-45" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                    {colors.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{colors.length - 5}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Size options - show as small badges */}
            {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {sizes.slice(0, 4).map((size) => {
                        const variant = product.variants.find((v) => v.size === size);
                        const isSelected = selectedVariant?.size === size;
                        const isAvailable = variant?.status === "IN_STOCK" && (variant?.inventory || 0) > 0;

                        return (
                            <button
                                key={size}
                                className={`
                  px-2 py-1 text-xs font-medium rounded border transition-all duration-200
                  ${
                      isSelected
                          ? "bg-black text-white border-black"
                          : isAvailable
                            ? "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }
                  focus:outline-none focus:ring-1 focus:ring-black
                `}
                                disabled={!isAvailable}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isAvailable && variant) {
                                        handleVariantSelect(variant);
                                    }
                                }}
                            >
                                {size}
                            </button>
                        );
                    })}
                    {sizes.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded border border-gray-200">+{sizes.length - 4}</span>
                    )}
                </div>
            )}

            {/* Price display */}
            {showPrice && selectedVariant && (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">${selectedVariant.price.toFixed(2)}</span>
                    {selectedVariant.old_price && <span className="text-sm text-gray-500 line-through">${selectedVariant.old_price.toFixed(2)}</span>}
                    {selectedVariant.status !== "IN_STOCK" && <span className="text-xs text-red-600 font-medium">Out of Stock</span>}
                </div>
            )}
        </div>
    );
};
