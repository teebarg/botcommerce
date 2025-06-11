"use client";

import React, { useState, useEffect } from "react";

import { Product, ProductVariant } from "@/types/models";
import { cn, currency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircleMore } from "lucide-react";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";
import { toast } from "sonner";
import { api } from "@/apis";
import { useStore } from "@/app/store/use-store";

interface VariantSelectionProps {
    product: Product;
    selectedVariant?: ProductVariant;
    onVariantChange: (variant: ProductVariant | undefined) => void;
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, selectedVariant, onVariantChange }) => {
    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const [selected, setSelected] = useState<ProductVariant | undefined>();
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const { shopSettings } = useStore();

    const sizes = [...new Set(product.variants?.filter((v) => v.size).map((v) => v.size))];
    const colors = [...new Set(product.variants?.filter((v) => v.color).map((v) => v.color))];

    const [selectedSize, setSelectedSize] = useState<string | null>(selected?.size || null);
    const [selectedColor, setSelectedColor] = useState<string | null>(selected?.color || null);

    const findMatchingVariant = (size: string | null, color: string | null) => {
        return product.variants?.find((variant) => {
            return variant.size === size && variant.color === color;
        });
    };

    useEffect(() => {
        setSelected(selectedVariant);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor);

        if (matchingVariant && matchingVariant !== selected) {
            setSelected(matchingVariant);
            onVariantChange(matchingVariant);
        } else {
            setSelected(undefined);
            onVariantChange(undefined);
        }
    }, [selectedSize, selectedColor]);

    const isOptionAvailable = (type: "size" | "color", value: string) => {
        if (type === "size") {
            return product.variants?.some(
                (v) => v.size === value && (!selectedColor || v.color === selectedColor) && v.status === "IN_STOCK" && v.inventory > 0
            );
        } else {
            return product.variants?.some(
                (v) => v.color === value && (!selectedSize || v.size === selectedSize) && v.status === "IN_STOCK" && v.inventory > 0
            );
        }
    };

    const toggleSizeSelect = (size: string) => {
        setSelectedSize((prev) => (prev === size ? null : size));
    };

    const toggleColorSelect = (color: string) => {
        setSelectedColor((prev) => (prev === color ? null : color));
    };

    const handleAddToCart = async () => {
        setLoading(true);
        const response = await api.cart.add({
            variant_id: selected?.id!,
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
        <div className="space-y-6">
            {sizes?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-default-800">Size</h3>
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
                                        "px-6 py-2 text-sm font-medium border border-default-300 rounded-md transition-all duration-200",
                                        isSelected
                                            ? "bg-teal-800 text-white"
                                            : available
                                              ? "bg-card text-default-800"
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
                    <h3 className="text-sm font-medium text-default-800">Color</h3>
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
                                        isSelected
                                            ? "border-teal-700"
                                            : available
                                              ? "border-default-300 hover:border-default-400"
                                              : "border-default-200 cursor-not-allowed opacity-60"
                                    )}
                                    disabled={!available}
                                    onClick={() => available && toggleColorSelect(color)}
                                >
                                    <div
                                        className={cn("w-10 h-10 rounded-full border border-default-200", !available && "opacity-50")}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                    />
                                    {!available && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-0.5 bg-default-400 rotate-45" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {selected && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-default-900">Selected Variant</p>
                            <p className="text-xs text-default-600">SKU: {selected.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-default-900">{currency(selected.price)}</p>
                            {selected.old_price && <p className="text-sm text-default-500 line-through">{currency(selected.old_price)}</p>}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <Badge variant={selected.status === "IN_STOCK" ? "emerald" : "destructive"}>
                            {selected.status ? "In Stock" : "Out of Stock"}
                        </Badge>
                        <span className="text-xs text-gray-600">{selected.inventory} available</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-default-900">Quantity:</label>
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

            {selected?.status === "OUT_OF_STOCK" ? (
                <Button className="mt-4 w-max px-16 py-6" disabled={true}>
                    Out of Stock
                </Button>
            ) : (
                <div className="flex items-center gap-4 mt-4">
                    <Button className="w-auto" disabled={loading || !selected} size="lg" variant="primary" onClick={handleAddToCart}>
                        {loading ? "Adding to cart..." : "Add to Cart"}
                    </Button>
                    <Button
                        disabled={loading || !selected}
                        className="gap-2 bg-[#075e54] hover:bg-[#128c7e] text-white w-auto"
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
