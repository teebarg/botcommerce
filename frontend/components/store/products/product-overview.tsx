import React, { useState } from "react";
import { Heart, Star, Plus, Minus, ShoppingCart, MessageCircle, X, Truck, Shield, RotateCcw } from "lucide-react";
import Image from "next/image";

import { DiscountBadge } from "./discount-badge";

import { ProductSearch } from "@/schemas/product";
import { cn, currency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LocalizedClientLink from "@/components/ui/link";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { useUserCreateWishlist, useUserDeleteWishlist } from "@/lib/hooks/useUser";

const ProductOverview: React.FC<{
    product: ProductSearch;
    isLiked?: boolean;
    onClose: () => void;
}> = ({ product, onClose, isLiked = false }) => {
    const {
        priceInfo,
        selectedColor,
        selectedSize,
        quantity,
        selectedVariant,
        setQuantity,
        sizes,
        colors,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        loading,
    } = useProductVariant(product);

    const { mutate: createWishlist } = useUserCreateWishlist();
    const { mutate: deleteWishlist } = useUserDeleteWishlist();

    const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
    const selectedImage = product.images[selectedImageIdx];

    const addWishlist = async () => {
        createWishlist(product.id);
    };

    const removeWishlist = async () => {
        deleteWishlist(product.id);
    };

    return (
        <div className="bg-content1 z-50 overflow-y-auto duration-300 w-full rounded-[inherit]">
            <div className="sticky top-0 z-20 bg-content1">
                <button
                    className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
                    onClick={onClose}
                >
                    <X className="text-gray-600 dark:text-gray-300" size={20} />
                </button>

                <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <Image
                        fill
                        alt={selectedImage || product.image || "placeholder"}
                        className="object-cover h-full w-full rounded"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={selectedImage || product.image || "/placeholder.jpg"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    <DiscountBadge discount={priceInfo.maxDiscountPercent} isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice} />

                    <div className="absolute bottom-4 left-4 right-4">
                        <LocalizedClientLink href={`/products/${product.slug}`}>
                            <h2 className="text-white text-2xl font-bold mb-1">{product.name}</h2>
                        </LocalizedClientLink>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-white text-sm ml-1">{product.average_rating}</span>
                                <span className="text-white/80 text-sm ml-1">({product.review_count} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 px-2 mt-4">
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

            <div className="py-6 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{currency(selectedVariant?.price)}</span>
                            {selectedVariant?.old_price > selectedVariant?.price && (
                                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">{currency(selectedVariant?.old_price)}</span>
                            )}
                        </div>
                        {selectedVariant?.old_price > selectedVariant?.price && (
                            <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                                You save {currency(selectedVariant?.old_price - selectedVariant?.price)}
                            </p>
                        )}
                    </div>
                    <button
                        className="p-3 bg-default-200 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            isLiked ? removeWishlist() : addWishlist();
                        }}
                    >
                        <Heart className={`w-6 h-6 ${isLiked ? "text-red-500 fill-current" : "text-default-600"}`} />
                    </button>
                </div>

                <div>
                    <p className="text-default-600 leading-relaxed">{product.description}</p>
                </div>

                <div className={cn("hidden", colors?.length > 1 && "block")}>
                    <h3 className="font-semibold text-default-900 mb-3">Color: {selectedColor}</h3>
                    <div className="flex space-x-3">
                        {colors?.map((color: string, idx: number) => {
                            const available = isOptionAvailable("color", color!);
                            const isSelected = selectedColor === color;

                            return (
                                <button
                                    key={idx}
                                    className={cn(
                                        "relative w-10 h-10 rounded-full transition-all border border-divider focus:outline-hidden",
                                        "ring-offset-1 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500",
                                        {
                                            "cursor-not-allowed opacity-60": !available,
                                        }
                                    )}
                                    data-state={isSelected ? "checked" : "unchecked"}
                                    disabled={!available}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    title={color}
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
                        <h3 className="font-semibold text-default-900 mb-3">Size: {selectedSize}</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes?.map((size: string, idx: number) => {
                                const available = isOptionAvailable("size", size!);
                                const isSelected = selectedSize === size;

                                return (
                                    <button
                                        key={idx}
                                        className={cn(
                                            "relative flex-1 px-4 py-2 rounded-lg border border-default-200 transition-all data-[state=checked]:ring-1 ring-offset-1",
                                            "data-[state=checked]:ring-blue-500 data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50",
                                            {
                                                "cursor-not-allowed opacity-60 bg-default-300": !available,
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
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-default-200">
                <div className="text-center">
                    <Truck className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-default-600">Fast Shipping</p>
                </div>
                <div className="text-center">
                    <Shield className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-default-600">Secure Payment</p>
                </div>
                <div className="text-center">
                    <RotateCcw className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-default-600">Easy Returns</p>
                </div>
            </div>

            <div className="sticky bottom-0 bg-content1 border-t border-default-200 p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-default-500">Total</p>
                            <p className="text-2xl font-bold text-default-900">{currency(selectedVariant?.price * quantity || 0)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-default-500">Quantity</p>
                            <p className="text-lg font-semibold text-default-900">
                                {quantity} item{quantity > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className={cn("flex gap-3 flex-row md:flex-row")}>
                        <Button disabled={loading || !selectedVariant} isLoading={loading} size="lg" variant="primary" onClick={handleAddToCart}>
                            <ShoppingCart className="w-5 h-5 relative z-10 hover:rotate-12 transition-transform duration-300 mr-2" />
                            <span className="relative z-10">Add to Cart</span>
                        </Button>
                        <Button disabled={loading || !selectedVariant} size="lg" variant="emerald" onClick={handleWhatsAppPurchase}>
                            <MessageCircle className="w-5 h-5 relative z-10 hover:animate-bounce mr-2" />
                            <span className="relative z-10">WhatsApp Buy</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOverview;
