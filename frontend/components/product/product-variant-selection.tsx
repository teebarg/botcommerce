"use client";

import React, { useState, useEffect } from "react";

import { Product, ProductVariant } from "@/types/models";

interface VariantSelectionProps {
    product: Product;
    selectedVariant?: ProductVariant;
    onVariantChange: (variant: ProductVariant) => void;
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, selectedVariant, onVariantChange }) => {
    const [selected, setSelected] = useState<ProductVariant | null>(selectedVariant || null);

    // Get unique values for each variant option
    const sizes = [...new Set(product.variants.filter((v) => v.size).map((v) => v.size))];
    const colors = [...new Set(product.variants.filter((v) => v.color).map((v) => v.color))];

    // Current selections
    const [selectedSize, setSelectedSize] = useState<string | null>(selected?.size || null);
    const [selectedColor, setSelectedColor] = useState<string | null>(selected?.color || null);

    // Find matching variant based on current selections
    const findMatchingVariant = (size: string | null, color: string | null) => {
        return product.variants.find((variant) => {
            const sizeMatch = !size || variant.size === size;
            const colorMatch = !color || variant.color === color;

            return sizeMatch && colorMatch;
        });
    };

    // Update selected variant when size or color changes
    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor);

        if (matchingVariant && matchingVariant !== selected) {
            setSelected(matchingVariant);
            onVariantChange(matchingVariant);
        }
    }, [selectedSize, selectedColor]);

    // Check if a variant option is available
    const isOptionAvailable = (type: "size" | "color", value: string) => {
        if (type === "size") {
            return product.variants.some(
                (v) => v.size === value && (!selectedColor || v.color === selectedColor) && v.status === "IN_STOCK" && v.inventory > 0
            );
        } else {
            return product.variants.some(
                (v) => v.color === value && (!selectedSize || v.size === selectedSize) && v.status === "IN_STOCK" && v.inventory > 0
            );
        }
    };

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    return (
        <div className="space-y-6">
            {/* Size Selection */}
            {sizes?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
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
                                    className={`
                    px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200
                    ${
                        isSelected
                            ? "bg-black text-white border-black"
                            : available
                              ? "bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                    }
                    focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                    min-w-[3rem] text-center
                  `}
                                    disabled={!available}
                                    onClick={() => available && handleSizeSelect(size)}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
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
                                    className={`
                    relative p-1 rounded-full border-2 transition-all duration-200
                    ${
                        isSelected
                            ? "border-black"
                            : available
                              ? "border-gray-300 hover:border-gray-400"
                              : "border-gray-200 cursor-not-allowed opacity-60"
                    }
                    focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                  `}
                                    disabled={!available}
                                    onClick={() => available && handleColorSelect(color)}
                                >
                                    <div
                                        className={`
                      w-8 h-8 rounded-full border border-gray-200
                      ${!available ? "opacity-50" : ""}
                    `}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                    />
                                    {!available && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-0.5 bg-gray-400 rotate-45" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Variant Info */}
            {selected && (
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Selected Variant</p>
                            <p className="text-xs text-gray-600">SKU: {selected.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${selected.price.toFixed(2)}</p>
                            {selected.old_price && <p className="text-sm text-gray-500 line-through">${selected.old_price.toFixed(2)}</p>}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <span
                            className={`
              inline-flex px-2 py-1 text-xs font-medium rounded-full
              ${selected.status === "IN_STOCK" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            `}
                        >
                            {selected.status === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                        </span>
                        <span className="text-xs text-gray-600">{selected.inventory} available</span>
                    </div>
                </div>
            )}
        </div>
    );
};
