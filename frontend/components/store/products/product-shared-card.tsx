"use client";

import React, { useState } from "react";
import { Eye, ShoppingBag, Star } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";

import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ClientOnly from "@/components/generic/client-only";
import ProductOverview from "@/components/store/products/product-overview";
import { cn, currency } from "@/lib/utils";
import { Product } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductSharedOverview from "./product-shared-overview";

interface ProductCardProps {
    product: Product;
    variant?: "bg-content1" | "bg-content2" | "bg-content3";
    size?: "sm" | "md" | "lg";
}

const ProductCardBase: React.FC<ProductCardProps> = ({ product, variant = "bg-content2", size = "md" }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { priceInfo, outOfStock, selectedVariant } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});

    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-card shadow-soft animate-fade-in">
            <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                    fill
                    src={product?.images?.[0]?.image || product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className={cn(
                        "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
                        imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    sizes="(max-width: 768px) 100vw, 33vw"
                />

                {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

                {/* Always visible gradient overlay for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <DiscountBadge discount={priceInfo.maxDiscountPercent} isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice} />

                    {/* Wishlist Heart */}
                    {/* <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 hover:scale-110 transition-all active:scale-95"
                        onClick={() => onToggleWishlist(product.id)}
                    >
                        <Heart className={cn("h-5 w-5 transition-all", isInWishlist ? "fill-red-500 text-red-500 scale-110" : "text-white")} />
                    </Button> */}
                </div>

                {outOfStock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Badge variant="secondary" className="text-lg px-6 py-2 backdrop-blur-sm">
                            Out of Stock
                        </Badge>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:transform md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                                <PriceLabel priceInfo={priceInfo} priceClassName="text-gray-100" oldPriceClassName="text-gray-300" />
                            </div>

                            {/* <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{product.rating}</span>
                            </div> */}
                        </div>

                        <div className="flex gap-3">
                            <Button className="flex-1 bg-white text-black hover:bg-white/90 font-semibold rounded-xl" disabled={outOfStock} size="lg">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Add to Cart
                            </Button>

                            <Overlay
                                open={dialogState.isOpen}
                                sheetClassName="min-w-[40vw]"
                                showCloseButton={false}
                                title="Details"
                                trigger={
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-12 w-12 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </Button>
                                }
                                onOpenChange={dialogState.setOpen}
                            >
                                <ProductSharedOverview isLiked={inWishlist} product={product} onClose={dialogState.close} />
                            </Overlay>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Info Bar */}
            {/* <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{product.category}</span>
                    <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
                </div>
            </div> */}
        </div>
    );
};

export default ProductCardBase;
