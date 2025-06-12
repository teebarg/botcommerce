"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Heart, ShoppingCart, MessageCircleMore, X, Star } from "lucide-react";
import { HeartFilled } from "nui-react-icons";

import { ProductSearch, ProductVariant, WishItem } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { cn, currency } from "@/lib/utils";
import { useInvalidate } from "@/lib/hooks/useApi";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";
import { useStore } from "@/app/store/use-store";
import { CompactVariantSelection } from "@/components/product/product-variant-compact-selection";
import ProductOverview from "./product-overview";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import Overlay from "@/components/overlay";

interface ProductCardProps {
    product: ProductSearch;
    showWishlist?: boolean;
    wishlist?: WishItem[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, wishlist, showWishlist = false }) => {
    const { shopSettings } = useStore();

    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const invalidate = useInvalidate();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const { id, slug, name, image, images } = product;
    const state = useOverlayTriggerState({});
    const dialogState = useOverlayTriggerState({});
    // const discountedPrice = old_price ? price - (price * (old_price - price)) / 100 : price;

    // const discount = old_price ? Math.round((1 - price / old_price) * 100) : 0;
    const inWishlist = !!wishlist?.find((wishlist) => wishlist.product_id === product.id);

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);

    const handleWishlistClick = async () => {
        const { error } = await api.user.addWishlist(id);

        if (error) {
            toast.error(error);

            return;
        }
        invalidate("wishlist");
        toast.success("Added to favorites");
    };

    const removeWishlist = async () => {
        const { error } = await api.user.deleteWishlist(id);

        if (error) {
            toast.error(error);

            return;
        }
        invalidate("wishlist");
        toast.success("Removed from favorites");
    };

    return (
        <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 cursor-pointer group"
            initial={{ opacity: 0, scale: 0.5 }}
            transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0, 0.71, 0.2, 1.01],
            }}
        >
            <div className="flex flex-col gap-2 w-full">
                <Overlay
                    open={dialogState.isOpen}
                    title="Details"
                    trigger={
                        <div>
                            <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-content1">
                                <Image
                                    fill
                                    alt={name}
                                    className="object-cover h-full w-full group-hover:scale-110 transition p-4"
                                    src={images?.[0] || image || "/placeholder.jpg"}
                                />
                                {showWishlist && (
                                    <Button
                                        className={cn(
                                            "absolute top-3 right-3 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100",
                                            inWishlist && "opacity-100"
                                        )}
                                        size="iconOnly"
                                    >
                                        {inWishlist ? <HeartFilled className="w-7 h-7 text-rose-400" /> : <Heart className="w-7 h-7" />}
                                    </Button>
                                )}
                            </div>
                            <div className="py-2">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                                <div className="flex items-center mb-2">
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600 ml-1">{product.ratings}</span>
                                    </div>
                                    <span className="text-sm text-gray-400 ml-2">({product.reviews || 1})</span>
                                </div>
                            </div>
                        </div>
                    }
                    sheetClassName="min-w-[40vw]"
                    onOpenChange={dialogState.setOpen}
                >
                    <ProductOverview product={product} onClose={dialogState.close} isLiked={inWishlist} />
                </Overlay>
                {/* <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-content1">
                    <Image
                        fill
                        alt={name}
                        className="object-cover h-full w-full group-hover:scale-110 transition p-4"
                        src={images?.[0] || image || "/placeholder.jpg"}
                    />
                    {showWishlist && (
                        <Button
                            className={cn(
                                "absolute top-3 right-3 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100",
                                inWishlist && "opacity-100"
                            )}
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                inWishlist ? removeWishlist() : handleWishlistClick();
                            }}
                        >
                            {inWishlist ? <HeartFilled className="w-7 h-7 text-rose-400" /> : <Heart className="w-7 h-7" />}
                        </Button>
                    )}
                </div> */}
                {/* <div className="font-semibold text-default-900 my-2 line-clamp-1 hover:text-default-900 transition-colors px-1">{name}</div> */}
                {/* <div className="py-2">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{product.ratings}</span>
                        </div>
                        <span className="text-sm text-gray-400 ml-2">({product.reviews})</span>
                    </div>
                </div> */}
                {/* <CompactVariantSelection product={product} onVariantChange={setSelectedVariant} /> */}
                {/* <div className="flex items-center justify-between px-1">
                    <div className="flex items-center">
                        <span className="text-lg font-semibold text-danger">{currency(price)}</span>
                        {old_price > price && <span className="ml-1 text-xs md:text-sm text-default-500 line-through">{currency(old_price)}</span>}
                    </div>
                    {old_price > price && (
                        <span className="text-xs font-semibold text-green-600">Save {(((old_price - price) / old_price) * 100).toFixed(0)}%</span>
                    )}
                </div> */}
                {/* <div className="space-y-2 mt-1">
                    <Button
                        className="gap-2"
                        disabled={loading || status == "OUT_OF_STOCK"}
                        isLoading={loading}
                        size="lg"
                        variant={status == "OUT_OF_STOCK" ? "ghost" : "primary"}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                    >
                        {status == "OUT_OF_STOCK" ? (
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
                </div> */}
            </div>
            {/* {state.isOpen && <ProductOverview product={product} onClose={state.close} />} */}
        </motion.div>
    );
};

export default ProductCard;
