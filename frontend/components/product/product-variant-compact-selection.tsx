"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, MessageCircleMore } from "lucide-react";

import { ProductSearch, ProductVariant } from "@/types/models";
import { cn, currency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";
import { api } from "@/apis";
import { useStore } from "@/app/store/use-store";

interface CompactVariantSelectionProps {
    product: ProductSearch;
    onVariantChange: (variant: ProductVariant) => void;
    showPrice?: boolean;
}

export const CompactVariantSelection: React.FC<CompactVariantSelectionProps> = ({ product, onVariantChange, showPrice = true }) => {
    console.log(product);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
        product.variants?.find((v) => v.status === "IN_STOCK") || product.variants?.[0]
    );

    console.log("🚀 ~ file: product-variant-compact-selection.tsx:17 ~ selectedVariant:", selectedVariant);

    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const [selected, setSelected] = useState<ProductVariant | undefined>();
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const { shopSettings } = useStore();

    const sizes = [...new Set(product.variants?.filter((v) => v.size).map((v) => v.size))];
    const colors = [...new Set(product.variants?.filter((v) => v.color).map((v) => v.color))];

    const [selectedSize, setSelectedSize] = useState<string | null>(selectedVariant?.size || null);
    const [selectedColor, setSelectedColor] = useState<string | null>(selectedVariant?.color || null);

    const findMatchingVariant = (size: string | null, color: string | null) => {
        return product.variants?.find((variant) => {
            return variant.size === size && variant.color === color;
        });
    };

    useEffect(() => {
        setSelectedVariant(product.variants?.find((v) => v.status === "IN_STOCK") || product.variants?.[0]);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor);

        if (matchingVariant && matchingVariant !== selectedVariant) {
            setSelectedVariant(matchingVariant);
            onVariantChange(matchingVariant);
        } else {
            setSelectedVariant(undefined);
            onVariantChange(undefined);
        }
    }, [selectedSize, selectedColor]);

    // const handleVariantSelect = (variant: ProductVariant) => {
    //     setSelectedVariant(variant);
    //     onVariantChange(variant);
    // };

    // const handleColorSelect = (color: string, e: React.MouseEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();

    //     const variant = product.variants?.find((v) => v.color === color && v.status === "IN_STOCK");

    //     if (variant) {
    //         handleVariantSelect(variant);
    //     }
    // };

    const toggleSizeSelect = (size: string) => {
        setSelectedSize((prev) => (prev === size ? null : size));
    };

    const toggleColorSelect = (color: string) => {
        setSelectedColor((prev) => (prev === color ? null : color));
    };

    const handleAddToCart = async () => {
        setLoading(true);
        const response = await api.cart.add({
            variant_id: selectedVariant?.id!,
            quantity,
        });

        if (response.error) {
            toast.error(response.error);
            setLoading(false);

            return;
        }
        invalidateCartItems();
        invalidateCart();

        toast.success("Added to cart successfully");
        setLoading(false);
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();
        const variantInfo = selectedVariant
            ? `\nSelected Variant:\nSize: ${selectedVariant.size || "N/A"}\nColor: ${selectedVariant.color || "N/A"}\nPrice: ${currency(selectedVariant.price)}`
            : "";

        const message = `Hi! I'm interested in purchasing:\n\n*${product.name}*${variantInfo}\nProduct Link: ${typeof window !== "undefined" ? window.location.origin : ""}/products/${product.slug}`;

        const whatsappUrl = `https://wa.me/${shopSettings?.whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="space-y-2">
            {colors.length > 0 && (
                <div className="flex gap-1">
                    {colors.slice(0, 5).map((color) => {
                        const variant = product.variants?.find((v) => v.color === color);
                        const isSelected = selectedVariant?.color === color;
                        const isAvailable = variant?.status === "IN_STOCK" && (variant?.inventory || 0) > 0;

                        return (
                            <button
                                key={color}
                                className={cn(
                                    "relative p-0.5 w-6 h-6 rounded-full border transition-all duration-200",
                                    isSelected
                                        ? "border-teal-700 border-2"
                                        : isAvailable
                                          ? "border-default-300 hover:border-default-400"
                                          : "border-default-200 cursor-not-allowed opacity-60"
                                )}
                                disabled={!isAvailable}
                                style={{ backgroundColor: color.toLowerCase() }}
                                onClick={() => isAvailable && toggleColorSelect(color)}
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

            {/* Size options */}
            {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {sizes.slice(0, 4).map((size) => {
                        const variant = product.variants?.find((v) => v.size === size);
                        const isSelected = selectedVariant?.size === size;
                        const isAvailable = variant?.status === "IN_STOCK" && (variant?.inventory || 0) > 0;

                        return (
                            <button
                                key={size}
                                className={cn(
                                    "px-2 py-1 text-xs font-medium border border-default-300 rounded-md transition-all duration-200",
                                    isSelected
                                        ? "bg-teal-800 text-white"
                                        : isAvailable
                                          ? "bg-card text-default-800"
                                          : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                )}
                                disabled={!isAvailable}
                                onClick={() => isAvailable && toggleSizeSelect(size)}
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
                    <span className="font-semibold text-gray-900">{currency(selectedVariant.price)}</span>
                    {selectedVariant.old_price && <span className="text-sm text-gray-500 line-through">{currency(selectedVariant.old_price)}</span>}
                    {selectedVariant.status !== "IN_STOCK" && <span className="text-xs text-red-600 font-medium">Out of Stock</span>}
                </div>
            )}

            <div className="space-y-2 mt-1">
                <Button
                    className="gap-2"
                    disabled={loading || selectedVariant?.status == "OUT_OF_STOCK"}
                    isLoading={loading}
                    size="lg"
                    variant={selectedVariant?.status == "OUT_OF_STOCK" ? "ghost" : "primary"}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                >
                    {selectedVariant?.status == "OUT_OF_STOCK" ? (
                        <span>Out of stock</span>
                    ) : (
                        <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to cart</span>
                        </>
                    )}
                </Button>
                <Button className="gap-2 bg-[#075e54] hover:bg-[#128c7e] text-white" size="lg" onClick={handleWhatsAppPurchase}>
                    <MessageCircleMore className="w-4 h-4" />
                    <span>Buy on WhatsApp</span>
                </Button>
            </div>
        </div>
    );
};
