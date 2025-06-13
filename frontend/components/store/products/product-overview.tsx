import React, { useEffect, useState } from "react";
import { ArrowLeft, Heart, Star, Plus, Minus, ShoppingCart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import ProductDetails from "./product-details";

import { ProductSearch, ProductVariant } from "@/types/models";
import { cn, currency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";
import { api } from "@/apis";
import { useStore } from "@/app/store/use-store";
import LocalizedClientLink from "@/components/ui/link";
import { useInvalidate } from "@/lib/hooks/useApi";

const ProductOverview: React.FC<{
    product: ProductSearch;
    isLiked?: boolean;
    onClose: () => void;
}> = ({ product, onClose, isLiked = false }) => {
    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const invalidate = useInvalidate();
    const [selectedColor, setSelectedColor] = useState<string | null>(product.variants?.[0].color || null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product.variants?.[0].size || null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const { shopSettings } = useStore();

    const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
    const selectedImage = product.images[selectedImageIdx];

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

        if (matchingVariant) {
            setSelectedVariant(matchingVariant);
        } else {
            setSelectedVariant(undefined);
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

    const addWishlist = async () => {
        const { error } = await api.user.addWishlist(product.id);

        if (error) {
            toast.error(error);

            return;
        }
        invalidate("wishlist");
        toast.success("Added to favorites");
    };

    const removeWishlist = async () => {
        const { error } = await api.user.deleteWishlist(product.id);

        if (error) {
            toast.error(error);

            return;
        }
        invalidate("wishlist");
        toast.success("Removed from favorites");
    };

    return (
        <div className="bg-content1 z-50 overflow-y-auto duration-300 w-full">
            <div className="sticky top-0 bg-content1/95 backdrop-blur-sm border-b border-default-200 px-4 py-2 flex items-center justify-between z-10">
                <Button size="icon" variant="ghost" onClick={onClose}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                    className="rounded-full"
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        isLiked ? removeWishlist() : addWishlist();
                    }}
                >
                    <Heart className={`w-6 h-6 ${isLiked ? "text-red-500 fill-current" : "text-default-600"}`} />
                </Button>
            </div>
            <div className="relative pt-4">
                <div className="relative h-full w-full flex-none flex flex-col-reverse md:flex-row gap-2 md:gap-4 px-0 md:px-8">
                    <div className="flex flex-wrap md:flex-col gap-4 px-2 md:px-0">
                        {product.images.map((image: string, idx: number) => (
                            <button
                                key={idx}
                                className={`w-16 h-16 rounded-md shrink-0 border-2 overflow-hidden relative ${
                                    selectedImageIdx === idx ? "border-indigo-500" : "border-gray-200"
                                }`}
                                onClick={() => setSelectedImageIdx(idx)}
                            >
                                <Image fill alt={`Thumbnail - ${image}`} className="object-cover w-full h-full" src={image} />
                            </button>
                        ))}
                    </div>
                    <div className="flex-1">
                        <div className="h-[60vh] flex items-center justify-center p-4 relative">
                            <Image
                                fill
                                alt={selectedImage || product.image || "placeholder"}
                                className="object-contain h-full w-full rounded"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src={selectedImage || product.image || "/placeholder.jpg"}
                            />
                        </div>
                    </div>
                </div>
                {selectedVariant?.old_price > selectedVariant?.price && (
                    <div className="absolute top-4 right-8 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        -{Math.round((1 - selectedVariant?.price / selectedVariant?.old_price) * 100)}% OFF
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <LocalizedClientLink className="text-2xl font-bold text-default-900 mb-2" href={`/products/${product.slug}`}>
                        {product.name}
                    </LocalizedClientLink>
                    <div className="flex items-center mb-3">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-medium text-default-900 ml-1">{product.ratings}</span>
                        </div>
                        <span className="text-default-500 ml-2">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl font-bold text-default-900">{currency(selectedVariant?.price)}</span>
                        {selectedVariant?.old_price > selectedVariant?.price && (
                            <span className="text-xl text-default-400 line-through">{currency(selectedVariant?.old_price)}</span>
                        )}
                    </div>
                </div>

                <div>
                    <p className="text-default-600 leading-relaxed">{product.description}</p>
                </div>

                <div className={cn("hidden", colors?.length > 1 && "block")}>
                    <h3 className="text-lg font-semibold text-default-900 mb-3">Color</h3>
                    <div className="flex space-x-3">
                        {colors?.map((color: string, idx: number) => {
                            const available = isOptionAvailable("color", color!);
                            const isSelected = selectedColor === color;

                            return (
                                <button
                                    key={idx}
                                    className={cn(
                                        "relative w-10 h-10 rounded-full transition-all border border-input focus:outline-hidden ring-offset-2 data-[state=checked]:ring-3 data-[state=checked]:ring-blue-500",
                                        {
                                            "cursor-not-allowed opacity-60": !available,
                                        }
                                    )}
                                    data-state={isSelected ? "checked" : "unchecked"}
                                    disabled={!available}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    onClick={() => available && toggleColorSelect(color)}
                                >
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

                {sizes?.length > 1 && (
                    <div>
                        <h3 className="text-lg font-semibold text-default-900 mb-3">Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes?.map((size: string, idx: number) => {
                                const available = isOptionAvailable("size", size!);
                                const isSelected = selectedSize === size;

                                return (
                                    <button
                                        key={idx}
                                        className={cn(
                                            "relative px-4 py-2 rounded-lg border border-default-200 transition-all data-[state=checked]:ring-1 data-[state=checked]:ring-blue-500 data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50",
                                            {
                                                "cursor-not-allowed opacity-60 bg-default-400": !available,
                                            }
                                        )}
                                        data-state={isSelected ? "checked" : "unchecked"}
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

                <div>
                    <h3 className="text-lg font-semibold text-default-900 mb-3">Quantity</h3>
                    <div className="flex items-center space-x-4">
                        <button
                            className="w-10 h-10 rounded-full border border-default-300 flex items-center justify-center hover:bg-default-50 transition-colors"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                        <button
                            className="w-10 h-10 rounded-full border border-default-300 flex items-center justify-center hover:bg-default-50 transition-colors"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-8 my-2">
                <ProductDetails />
            </div>

            <div className="sticky bottom-0 bg-content1 border-t border-default-200 p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-default-500">Total</p>
                            <p className="text-2xl font-bold text-default-900">{currency(selectedVariant?.price * quantity)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-default-500">Quantity</p>
                            <p className="text-lg font-semibold text-default-900">
                                {quantity} item{quantity > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className={cn("flex gap-3 flex-col md:flex-row")}>
                        <Button disabled={loading || !selectedVariant} isLoading={loading} size="lg" variant="primary" onClick={handleAddToCart}>
                            <ShoppingCart className="w-5 h-5 relative z-10 hover:rotate-12 transition-transform duration-300 mr-2" />
                            <span className="relative z-10">Add to Cart</span>
                        </Button>
                        <Button disabled={loading || !selectedVariant} size="lg" variant="emerald" onClick={handleWhatsAppPurchase}>
                            <MessageCircle className="w-5 h-5 relative z-10 hover:animate-bounce mr-2" />
                            <span className="relative z-10">Buy on WhatsApp</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOverview;
