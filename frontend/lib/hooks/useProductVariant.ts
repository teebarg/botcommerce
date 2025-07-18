"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useAddToCart } from "./useCart";

import { currency } from "@/lib/utils";
import { useStore } from "@/app/store/use-store";
import { ProductVariant } from "@/schemas";
import { Product, ProductSearch } from "@/schemas/product";

export const useProductVariant = (product: Product | ProductSearch) => {
    const { shopSettings } = useStore();
    const { mutate: addToCart, isPending: loading } = useAddToCart();

    const [selectedColor, setSelectedColor] = useState<string | null>(product.variants?.[0]?.color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product.variants?.[0]?.size || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();

    const sizes = useMemo(() => {
        return [...new Set(product.variants?.filter((v) => v.size).map((v) => v.size))];
    }, [product.variants]);

    const colors = useMemo(() => {
        return [...new Set(product.variants?.filter((v) => v.color).map((v) => v.color))];
    }, [product.variants]);

    const priceInfo = useMemo(() => {
        const prices = product.variants?.map((v: ProductVariant) => v.price) || [];
        const comparePrices = product.variants?.map((v: ProductVariant) => v.old_price || v.price) || [];

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minCompareAtPrice = Math.min(...comparePrices);
        const maxCompareAtPrice = Math.max(...comparePrices);

        const hasDiscount = product.variants?.some((v) => v.old_price && v.old_price > v.price);
        const allDiscounted = product.variants?.every((v) => v.old_price && v.old_price > v.price);

        const maxDiscountPercent = Math.round(((maxCompareAtPrice - minPrice) / maxCompareAtPrice) * 100);

        return {
            minPrice,
            maxPrice,
            minCompareAtPrice,
            maxCompareAtPrice,
            hasDiscount,
            allDiscounted,
            maxDiscountPercent,
        };
    }, [product.variants]);

    const findMatchingVariant = (size: string | null, color: string | null) => {
        if (product.variants?.length == 0) {
            return undefined;
        }
        return product.variants?.find((variant) => variant.size === size && variant.color === color);
    };

    useEffect(() => {
        setSelectedVariant(product.variants?.find((v) => v.status === "IN_STOCK") || product.variants?.[0]);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor);
        setSelectedVariant(matchingVariant ?? undefined);
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
        if (!selectedVariant) return;
        addToCart({
            variant_id: selectedVariant.id,
            quantity,
        });
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();

        const variantInfo = selectedVariant
            ? `\nSelected Variant:\nSize: ${selectedVariant.size || "N/A"}\nColor: ${selectedVariant.color || "N/A"}\nPrice: ${currency(
                  selectedVariant.price
              )}`
            : "";

        const message = `Hi! I'd like to order:\n\n*${product.name}*\n${variantInfo}\nQuantity: ${quantity}\n\n*Total: ${currency(selectedVariant?.price * quantity)}*\n\n${
            typeof window !== "undefined" ? window.location.origin : ""
        }/products/${product.slug}\n\nPlease let me know the next steps for payment and delivery. Thank you!`;

        const whatsappUrl = `https://wa.me/${shopSettings?.whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
    };

    return {
        selectedColor,
        setSelectedColor,
        selectedSize,
        setSelectedSize,
        quantity,
        setQuantity,
        selectedVariant,
        sizes,
        colors,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        priceInfo,
        loading,
        outOfStock: product.variants?.length == 0 || product.variants?.every((v) => v.status === "OUT_OF_STOCK"),
    };
};
