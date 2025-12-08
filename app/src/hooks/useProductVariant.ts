import type React from "react";
import { useEffect, useMemo, useState } from "react";

import { useAddToCart, useChangeCartQuantity } from "./useCart";
import { currency } from "@/utils";
import { useConfig } from "@/providers/store-provider";
import type { ProductVariant } from "@/schemas";
import type { Product, ProductSearch } from "@/schemas/product";
import { useCart } from "@/providers/cart-provider";
import { isFirstWhatsAppMessage, markFirstWhatsAppMessageSent } from "@/utils/whatsapp-message-state";

export const useProductVariant = (product: Product | ProductSearch) => {
    const { cart } = useCart();
    const { config } = useConfig();
    const { mutateAsync: addToCart, isPending: creating } = useAddToCart();
    const { mutateAsync: updateQuantity, isPending: updating } = useChangeCartQuantity();
    const [isAdded, setIsAdded] = useState<boolean>(false);

    const loading = creating || updating;

    const [selectedColor, setSelectedColor] = useState<string | null>(product?.variants?.[0]?.color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product?.variants?.[0]?.size || null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<number | null>(product?.variants?.[0]?.measurement || null);
    const [selectedAge, setSelectedAge] = useState<string | null>(product?.variants?.[0]?.age || null);
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

    const ages = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.age).map((v) => v.age))];
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

    const findMatchingVariant = (size: string | null, color: string | null, measurement: number | null, age: string | null) => {
        if (product?.variants?.length == 0) {
            return undefined;
        }
        if (product?.variants?.length == 1) {
            return product?.variants[0];
        }
        if (!size && !color && !measurement && !age) {
            return product?.variants?.find((variant) => variant.inventory > 0);
        }

        return product?.variants?.find(
            (variant) => variant.size === size && variant.color === color && variant.measurement === measurement && variant.age === age
        );
    };

    useEffect(() => {
        setSelectedVariant(product?.variants?.find((v) => v.inventory > 0) || product?.variants?.[0]);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor, selectedMeasurement, selectedAge);

        setSelectedVariant(matchingVariant ?? undefined);
    }, [selectedSize, selectedColor, selectedMeasurement, selectedAge]);

    const isOptionAvailable = (type: "size" | "color" | "measurement" | "age", value: string) => {
        if (type === "size") {
            return product?.variants?.some(
                (v) =>
                    v.size === value &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedMeasurement || v.measurement === selectedMeasurement) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "color") {
            return product?.variants?.some(
                (v) =>
                    v.color === value &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedMeasurement || v.measurement === selectedMeasurement) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "measurement") {
            return product?.variants?.some(
                (v) =>
                    v.measurement === parseInt(value) &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "age") {
            return product?.variants?.some(
                (v) =>
                    v.age === value &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedMeasurement || v.measurement === selectedMeasurement) &&
                    v.inventory > 0
            );
        }

        return false;
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

    const toggleAgeSelect = (age: string) => {
        setSelectedAge((prev) => (prev === age ? null : age));
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        if (variantInCart) {
            updateQuantity({ item_id: variantInCart.id, quantity: variantInCart.quantity + quantity }).then(() => {
                setIsAdded(true);
            });
            setTimeout(() => setIsAdded(false), 3000);

            return;
        }
        addToCart({
            variant_id: selectedVariant.id,
            quantity,
        }).then(() => {
            setIsAdded(true);
        });
        setTimeout(() => setIsAdded(false), 3000);
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();

        const variantInfo = selectedVariant
            ? [
                  selectedVariant.size && `Size: ${selectedVariant.size}`,
                  selectedVariant.color && `Color: ${selectedVariant.color}`,
                  selectedVariant.measurement && `Measurement: ${selectedVariant.measurement}`,
                  selectedVariant.age && `Age: ${selectedVariant.age}`,
                  `Price: ${currency(selectedVariant.price)}`,
              ]
                  .filter(Boolean)
                  .join("\n")
            : "";

        let message: string;

        if (isFirstWhatsAppMessage()) {
            message = `Hi! I'd like to order:\n\n${variantInfo}\nQuantity: ${quantity}\n\n*Total: ${currency(selectedVariant?.price * quantity)}*\n\n${
                typeof window !== "undefined" ? window.location.origin : ""
            }/products/${product.slug}\n\nPlease let me know the next steps for payment and delivery. Thank you!`;
        } else {
            message = `${variantInfo}\nQuantity: ${quantity}\n\n*Total: ${currency(selectedVariant?.price * quantity)}*\n\n${
                typeof window !== "undefined" ? window.location.origin : ""
            }/products/${product.slug}`;
        }

        const whatsappUrl = `https://wa.me/${config?.whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
        markFirstWhatsAppMessageSent();
    };

    return {
        selectedColor,
        setSelectedColor,
        selectedSize,
        setSelectedSize,
        selectedMeasurement,
        setSelectedMeasurement,
        selectedAge,
        setSelectedAge,
        quantity,
        setQuantity,
        selectedVariant,
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
        priceInfo,
        loading,
        isAdded,
        outOfStock: product?.variants?.length == 0 || product?.variants?.every((v) => v.inventory <= 0),
    };
};
