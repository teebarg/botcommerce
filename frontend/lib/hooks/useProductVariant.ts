"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useAddToCart, useChangeCartQuantity } from "./useCart";

import { currency } from "@/lib/utils";
import { useStoreSettings } from "@/providers/store-provider";
import { ProductVariant } from "@/schemas";
import { Product, ProductSearch } from "@/schemas/product";
import { useCart } from "@/providers/cart-provider";

export const useProductVariant = (product: Product | ProductSearch) => {
    const { cart } = useCart();
    const { settings } = useStoreSettings();
    const { mutate: addToCart, isPending: creating } = useAddToCart();
    const { mutateAsync: updateQuantity, isPending: updating } = useChangeCartQuantity();

    const loading = creating || updating;

    const [selectedColor, setSelectedColor] = useState<string | null>(product?.variants?.[0]?.color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product?.variants?.[0]?.size || null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<number | null>(product?.variants?.[0]?.measurement || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();

    const sizes = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.size).map((v) => v.size))];
    }, [product?.variants]);

    const colors = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.color).map((v) => v.color))];
    }, [product?.variants]);

    const measurements = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.measurement).map((v) => v.measurement))];
    }, [product?.variants]);

    const priceInfo = useMemo(() => {
        const prices = product?.variants?.map((v: ProductVariant) => v.price) || [];
        const comparePrices = product?.variants?.map((v: ProductVariant) => v.old_price || v.price) || [];

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minCompareAtPrice = Math.min(...comparePrices);
        const maxCompareAtPrice = Math.max(...comparePrices);

        const hasDiscount = product?.variants?.some((v) => v.old_price && v.old_price > v.price);
        const allDiscounted = product?.variants?.every((v) => v.old_price && v.old_price > v.price);

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
    }, [product?.variants]);

    const variantInCart = useMemo(() => {
        return cart?.items?.find((item) => item.variant_id == selectedVariant?.id);
    }, [cart, selectedVariant]);

    const maxQuantity = useMemo(() => {
        if (!selectedVariant) return 1;
        const inCartQuantity = variantInCart?.quantity || 0;

        return Math.max(1, selectedVariant.inventory - inCartQuantity);
    }, [selectedVariant, variantInCart]);

    const findMatchingVariant = (size: string | null, color: string | null, measurement: number | null) => {
        if (product?.variants?.length == 0) {
            return undefined;
        }
        if (product?.variants?.length == 1) {
            return product?.variants[0];
        }
        if (!size && !color && !measurement) {
            return product?.variants?.find((variant) => variant.inventory > 0);
        }

        return product?.variants?.find((variant) => variant.size === size && variant.color === color && variant.measurement === measurement);
    };

    useEffect(() => {
        setSelectedVariant(product?.variants?.find((v) => v.inventory > 0) || product?.variants?.[0]);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor, selectedMeasurement);

        setSelectedVariant(matchingVariant ?? undefined);
    }, [selectedSize, selectedColor, selectedMeasurement]);

    const isOptionAvailable = (type: "size" | "color" | "measurement", value: string) => {
        if (type === "size") {
            return product?.variants?.some(
                (v) =>
                    v.size === value &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedMeasurement || v.measurement === selectedMeasurement) &&
                    v.inventory > 0
            );
        } else if (type === "color") {
            return product?.variants?.some(
                (v) =>
                    v.color === value &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedMeasurement || v.measurement === selectedMeasurement) &&
                    v.inventory > 0
            );
        } else {
            return product?.variants?.some(
                (v) =>
                    v.measurement === parseInt(value) &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedColor || v.color === selectedColor) &&
                    v.inventory > 0
            );
        }
    };

    const toggleSizeSelect = (size: string) => {
        setSelectedSize((prev) => (prev === size ? null : size));
    };

    const toggleColorSelect = (color: string) => {
        setSelectedColor((prev) => (prev === color ? null : color));
    };

    const toggleMeasurementSelect = (measurement: number) => {
        setSelectedMeasurement((prev) => (prev === measurement ? null : measurement));
    };

    const setQuantitySafely = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        // Check inventory before adding to cart
        const totalQuantity = variantInCart ? variantInCart.quantity + quantity : quantity;

        if (totalQuantity > selectedVariant.inventory) {
            // This will be handled by the backend validation, but we can provide immediate feedback
            return;
        }

        if (variantInCart) {
            await updateQuantity({ item_id: variantInCart.id, quantity: variantInCart.quantity + quantity });

            return;
        }
        addToCart({
            variant_id: selectedVariant.id,
            quantity,
        });
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();

        const variantInfo = selectedVariant
            ? `\nSelected Variant:\nSize: ${selectedVariant.size || "N/A"}\nColor: ${selectedVariant.color || "N/A"}\nMeasurement: ${selectedVariant.measurement || "N/A"}\nPrice: ${currency(
                  selectedVariant.price
              )}`
            : "";

        const message = `Hi! I'd like to order:\n\n*${product.name}*\n${variantInfo}\nQuantity: ${quantity}\n\n*Total: ${currency(selectedVariant?.price * quantity)}*\n\n${
            typeof window !== "undefined" ? window.location.origin : ""
        }/products/${product.slug}\n\nPlease let me know the next steps for payment and delivery. Thank you!`;

        const whatsappUrl = `https://wa.me/${settings?.whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
    };

    return {
        selectedColor,
        setSelectedColor,
        selectedSize,
        setSelectedSize,
        selectedMeasurement,
        setSelectedMeasurement,
        quantity,
        setQuantity,
        setQuantitySafely,
        maxQuantity,
        selectedVariant,
        sizes,
        colors,
        measurements,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        toggleMeasurementSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        priceInfo,
        loading,
        outOfStock: product?.variants?.length == 0 || product?.variants?.every((v) => v.inventory <= 0),
    };
};
