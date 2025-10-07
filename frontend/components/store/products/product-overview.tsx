import React, { useState, useEffect } from "react";
import { Heart, Star, Plus, Minus, ShoppingCart, MessageCircle, X, Truck, Shield, RotateCcw } from "lucide-react";
import { useSession } from "next-auth/react";

import { DiscountBadge } from "./discount-badge";

import { ProductSearch } from "@/schemas";
import { cn, currency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LocalizedClientLink from "@/components/ui/link";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { useUserCreateWishlist, useUserDeleteWishlist } from "@/lib/hooks/useUser";
import { UserInteractionType, useTrackUserInteraction } from "@/lib/hooks/useUserInteraction";
import { ImageDownloadButton } from "@/components/store/image-download";

const ProductOverview: React.FC<{
    product: ProductSearch;
    isLiked?: boolean;
    onClose: () => void;
}> = ({ product, onClose, isLiked = false }) => {
    const {
        priceInfo,
        selectedColor,
        selectedSize,
        selectedMeasurement,
        quantity,
        selectedVariant,
        setQuantity,
        sizes,
        colors,
        measurements,
        isOptionAvailable,
        toggleSizeSelect,
        toggleColorSelect,
        toggleMeasurementSelect,
        handleAddToCart,
        handleWhatsAppPurchase,
        loading,
        outOfStock,
    } = useProductVariant(product);

    const { mutate: createWishlist } = useUserCreateWishlist();
    const { mutate: deleteWishlist } = useUserDeleteWishlist();

    const { data: session } = useSession();
    const trackInteraction = useTrackUserInteraction();

    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const timeSpent = Date.now() - startTime;

            handleUserInteraction("VIEW", { timeSpent });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.id, product?.id]);

    const handleAddToCartAndTrack = () => {
        handleUserInteraction("CART_ADD");
        handleAddToCart();
    };

    const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
    const selectedImage = product.images[selectedImageIdx];

    const addWishlist = async () => {
        createWishlist(product.id);
        handleUserInteraction("WISHLIST_ADD");
    };

    const removeWishlist = async () => {
        deleteWishlist(product.id);
        handleUserInteraction("WISHLIST_REMOVE");
    };

    const handleUserInteraction = async (type: UserInteractionType, metadata?: Record<string, any>) => {
        if (session?.user && product?.id) {
            trackInteraction.mutate({
                user_id: session.id,
                product_id: product.id,
                type,
                metadata: { source: "product-overview", ...metadata },
            });
        }
    };

    return (
        <div className="z-50 overflow-y-auto duration-300 w-full rounded-[inherit]">
            <div className="sticky top-safe z-20 bg-background">
                <button
                    className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
                    onClick={onClose}
                >
                    <X className="text-gray-600 dark:text-gray-300" size={20} />
                </button>

                <div className="relative h-[60vh] overflow-hidden">
                    <img
                        alt={product.name}
                        className="object-contain h-full w-full rounded"
                        src={selectedImage || product.images[0] || "/placeholder.jpg"}
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
                    {session?.user?.isAdmin && (
                        <ImageDownloadButton className="absolute bottom-4 right-6" fallbackName={product.slug} url={product.images?.[0] || ""} />
                    )}
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
                        <img alt={image} className="object-cover" src={image} />
                    </button>
                ))}
            </div>

            <div className="py-6 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-3xl font-bold">{currency(selectedVariant?.price || priceInfo.minPrice)}</span>
                            {selectedVariant?.old_price > selectedVariant?.price && (
                                <span className="text-lg text-muted-foreground line-through">{currency(selectedVariant?.old_price)}</span>
                            )}
                        </div>
                        {selectedVariant?.old_price > selectedVariant?.price && (
                            <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                                You save {currency(selectedVariant?.old_price - selectedVariant?.price)}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-3 bg-secondary rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                isLiked ? removeWishlist() : addWishlist();
                            }}
                        >
                            <Heart className={`w-6 h-6 ${isLiked ? "text-red-500 fill-current" : "text-muted-foreground"}`} />
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className={cn("hidden", colors?.length > 0 && "block")}>
                    <h3 className="font-semibold mb-3">Color: {selectedColor}</h3>
                    <div className="flex space-x-3">
                        {colors?.map((color: string, idx: number) => {
                            const available = isOptionAvailable("color", color!);
                            const isSelected = selectedColor === color;

                            return (
                                <button
                                    key={idx}
                                    className={cn(
                                        "relative w-10 h-10 rounded-full transition-all border border-input focus:outline-hidden",
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
                                            <div className="w-6 h-0.5 bg-border rotate-45" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={cn("hidden", measurements?.length > 0 && "block")}>
                    <h3 className="font-semibold mb-3">Measurement: {selectedMeasurement}</h3>
                    <div className="flex gap-2">
                        {measurements?.map((measurement: number, idx: number) => {
                            const available = isOptionAvailable("measurement", measurement.toString());
                            const isSelected = selectedMeasurement === measurement;

                            return (
                                <button
                                    key={idx}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border border-border transition-all data-[state=checked]:ring-1 ring-offset-1",
                                        "data-[state=checked]:ring-blue-500 data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50",
                                        {
                                            "cursor-not-allowed opacity-60 bg-secondary": !available,
                                        }
                                    )}
                                    data-state={isSelected ? "checked" : "unchecked"}
                                    disabled={!available}
                                    onClick={() => available && toggleMeasurementSelect(measurement)}
                                >
                                    {measurement}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={cn("hidden", sizes?.length > 0 && "block")}>
                    <h3 className="font-semibold mb-3">Size: {selectedSize}</h3>
                    <div className="flex gap-2">
                        {sizes?.map((size: string, idx: number) => {
                            const available = isOptionAvailable("size", size!);
                            const isSelected = selectedSize === size;

                            return (
                                <button
                                    key={idx}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border border-border transition-all data-[state=checked]:ring-1 ring-offset-1",
                                        "data-[state=checked]:ring-blue-500 data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50",
                                        {
                                            "cursor-not-allowed opacity-60 bg-secondary": !available,
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

                <div>
                    <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                    <div className="flex items-center space-x-4">
                        <button
                            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={quantity <= 1}
                            onClick={() => setQuantity(quantity - 1)}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                        <button
                            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={quantity >= selectedVariant?.inventory}
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
                <div className="text-center">
                    <Truck className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Fast Shipping</p>
                </div>
                <div className="text-center">
                    <Shield className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
                <div className="text-center">
                    <RotateCcw className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text- muted-foreground">Easy Returns</p>
                </div>
            </div>

            <div className="sticky bottom-0 p-4 bg-background">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold text-foreground">{currency(selectedVariant?.price * quantity || 0)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="text-lg font-semibold text-foreground">
                                {quantity} item{quantity > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className={cn("flex gap-3 flex-row")}>
                        <Button disabled={loading || !selectedVariant || outOfStock} isLoading={loading} size="lg" onClick={handleAddToCartAndTrack}>
                            <ShoppingCart className="w-5 h-5 relative z-10 hover:rotate-12 transition-transform duration-300 mr-2" />
                            <span className="relative z-10">{outOfStock ? "Out of Stock" : "Add to Cart"}</span>
                        </Button>
                        <Button disabled={loading || !selectedVariant || outOfStock} size="lg" variant="emerald" onClick={handleWhatsAppPurchase}>
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
