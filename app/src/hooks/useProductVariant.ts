import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useAddToCart, useChangeCartQuantity } from "./useCart";
import { currency } from "@/utils";
import { useConfig } from "@/providers/store-provider";
import type { ProductLite, ProductSearch, ProductVariantLite } from "@/schemas/product";
import { useCart } from "@/providers/cart-provider";
import { isFirstWhatsAppMessage, markFirstWhatsAppMessageSent } from "@/utils/whatsapp-message-state";
import { analytics } from "@/utils/pulsemetric";
import { CartItem } from "@/schemas";

export const useProductVariant = (product: ProductLite | ProductSearch) => {
    const { cart } = useCart();
    const { config } = useConfig();
    const { mutateAsync: addToCart, isPending: creating } = useAddToCart();
    const { mutateAsync: updateQuantity, isPending: updating } = useChangeCartQuantity();
    const [isAdded, setIsAdded] = useState<boolean>(false);

    const loading = creating || updating;

    const [selectedColor, setSelectedColor] = useState<string | null>(product?.variants?.[0]?.color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product?.variants?.[0]?.size || null);
    const [selectedWidth, setSelectedWidth] = useState<number | null>(product?.variants?.[0]?.width || null);
    const [selectedLength, setSelectedLength] = useState<number | null>(product?.variants?.[0]?.length || null);
    const [selectedAge, setSelectedAge] = useState<string | null>(product?.variants?.[0]?.age || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantLite | undefined>();

    const sizes = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.size).map((v) => v.size))];
    }, [product?.variants]);

    const colors = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.color).map((v) => v.color))];
    }, [product?.variants]);

    const widths = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.width).map((v) => v.width))];
    }, [product?.variants]);

    const lengths = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.length).map((v) => v.length))];
    }, [product?.variants]);

    const ages = useMemo(() => {
        return [...new Set(product?.variants?.filter((v) => v.age).map((v) => v.age))];
    }, [product?.variants]);

    const priceInfo = useMemo(() => {
        const prices = product?.variants?.map((v: ProductVariantLite) => v.price) || [];
        const comparePrices = product?.variants?.map((v: ProductVariantLite) => v.old_price || v.price) || [];

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
        return cart?.items?.find((item: CartItem) => item.variant_id == selectedVariant?.id);
    }, [cart, selectedVariant]);

    const findMatchingVariant = (size: string | null, color: string | null, width: number | null, length: number | null, age: string | null) => {
        if (product?.variants?.length == 0) {
            return undefined;
        }
        if (product?.variants?.length == 1) {
            return product?.variants[0];
        }
        if (!size && !color && !width && !length && !age) {
            return product?.variants?.find((variant) => variant.inventory > 0);
        }

        return product?.variants?.find(
            (variant) => variant.size === size && variant.color === color && variant.width === width && variant.length === length && variant.age === age
        );
    };

    useEffect(() => {
        setSelectedVariant(product?.variants?.find((v) => v.inventory > 0) || product?.variants?.[0]);
    }, []);

    useEffect(() => {
        const matchingVariant = findMatchingVariant(selectedSize, selectedColor, selectedWidth, selectedLength, selectedAge);

        setSelectedVariant(matchingVariant ?? undefined);
    }, [selectedSize, selectedColor, selectedWidth, selectedLength, selectedAge]);

    const isOptionAvailable = (type: "size" | "color" | "width" | "length" | "age", value: string | number) => {
        if (type === "size") {
            return product?.variants?.some(
                (v) =>
                    v.size === value &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedWidth || v.width === selectedWidth) &&
                    (!selectedLength || v.length === selectedLength) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "color") {
            return product?.variants?.some(
                (v) =>
                    v.color === value &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedWidth || v.width === selectedWidth) &&
                    (!selectedLength || v.length === selectedLength) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "width") {
            return product?.variants?.some(
                (v) =>
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedLength || v.length === selectedLength) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "length") {
            return product?.variants?.some(
                (v) =>
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedWidth || v.width === selectedWidth) &&
                    (!selectedAge || v.age === selectedAge) &&
                    v.inventory > 0
            );
        } else if (type === "age") {
            return product?.variants?.some(
                (v) =>
                    v.age === value &&
                    (!selectedSize || v.size === selectedSize) &&
                    (!selectedColor || v.color === selectedColor) &&
                    (!selectedWidth || v.width === selectedWidth) &&
                    (!selectedLength || v.length === selectedLength) &&
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

    const toggleWidthSelect = (width: number) => {
        setSelectedWidth((prev) => (prev === width ? null : width));
    };

    const toggleLengthSelect = (length: number) => {
        setSelectedLength((prev) => (prev === length ? null : length));
    };

    const toggleAgeSelect = (age: string) => {
        setSelectedAge((prev) => (prev === age ? null : age));
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        if (variantInCart) {
            updateQuantity({ item_id: variantInCart.id, quantity: variantInCart.quantity + quantity }).then(() => {
                setIsAdded(true);
                analytics.addToCart({
                    product_id: product.id.toString(),
                    product_name: product.name,
                    quantity,
                    price: selectedVariant.price,
                });
            });
            setTimeout(() => setIsAdded(false), 3000);

            return;
        }
        addToCart({
            variant_id: selectedVariant.id,
            quantity,
        }).then(() => {
            setIsAdded(true);
            analytics.addToCart({
                product_id: product.id.toString(),
                product_name: product.name,
                quantity,
                price: selectedVariant.price,
            });
        });
        setTimeout(() => setIsAdded(false), 3000);
    };

    const handleWhatsAppPurchase = (e: React.MouseEvent) => {
        e.stopPropagation();

        const variantInfo = selectedVariant
            ? [
                  selectedVariant.size && `Size: ${selectedVariant.size}`,
                  selectedVariant.color && `Color: ${selectedVariant.color}`,
                  selectedVariant.width && `Width: ${selectedVariant.width}`,
                  selectedVariant.length && `Length: ${selectedVariant.length}`,
                  selectedVariant.age && `Age: ${selectedVariant.age}`,
                  `Price: ${currency(selectedVariant.price)}`,
              ]
                  .filter(Boolean)
                  .join("\n")
            : "";

        let message: string;

        if (isFirstWhatsAppMessage()) {
            message = `Hi! I'd like to order:\n\n${variantInfo}\nQuantity: ${quantity}\n\n*Total: ${currency(
                selectedVariant?.price || 0 * quantity
            )}*\n\n${typeof window !== "undefined" ? window.location.origin : ""}/products/${
                product.slug
            }\n\nPlease let me know the next steps for payment and delivery. Thank you!`;
        } else {
            message = `${variantInfo}\nQuantity: ${quantity}\n\n*Total: ${currency(selectedVariant?.price || 0 * quantity)}*\n\n${
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
        selectedWidth,
        setSelectedWidth,
        selectedLength,
        setSelectedLength,
        selectedAge,
        setSelectedAge,
        quantity,
        setQuantity,
        selectedVariant,
        sizes,
        colors,
        widths,
        lengths,
        ages,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        toggleWidthSelect,
        toggleLengthSelect,
        toggleAgeSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        priceInfo,
        loading,
        isAdded,
        outOfStock: product?.variants?.length == 0 || product?.variants?.every((v) => v.inventory <= 0),
    };
};
