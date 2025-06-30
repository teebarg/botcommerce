import React, { useEffect, useState } from "react";

import { currency } from "@/lib/utils";
import { useStore } from "@/app/store/use-store";
import { ProductVariant } from "@/schemas";
import { Product, ProductSearch } from "@/schemas/product";
import { useAddToCart } from "./useCart";

export const useProductVariant = (product: Product | ProductSearch) => {
    const { shopSettings } = useStore();

    const [selectedColor, setSelectedColor] = useState<string | null>(product.variants?.[0]?.color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product.variants?.[0]?.size || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
    const [loading, setLoading] = useState<boolean>(false);

    const sizes = [...new Set(product.variants?.filter((v) => v.size).map((v) => v.size))];
    const colors = [...new Set(product.variants?.filter((v) => v.color).map((v) => v.color))];

    const findMatchingVariant = (size: string | null, color: string | null) => {
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

    const addToCart = useAddToCart();

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        setLoading(true);

        await addToCart.mutateAsync({
            variant_id: selectedVariant.id,
            quantity,
        });
        setLoading(false);
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();
        const variantInfo = selectedVariant
            ? `\nSelected Variant:\nSize: ${selectedVariant.size || "N/A"}\nColor: ${selectedVariant.color || "N/A"}\nPrice: ${currency(
                  selectedVariant.price
              )}`
            : "";

        const message = `Hi! I'm interested in purchasing:\n\n*${product.name}*${variantInfo}\nProduct Link: ${
            typeof window !== "undefined" ? window.location.origin : ""
        }/products/${product.slug}`;

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
        loading,
    };
};
