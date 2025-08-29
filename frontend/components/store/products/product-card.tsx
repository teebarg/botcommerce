"use client";

import React, { useState } from "react";
import { Check, Star } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";

import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ProductOverview from "@/components/store/products/product-overview";
import { cn } from "@/lib/utils";
import { ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { ManageSlate } from "@/components/admin/shared-collections/manage-slate";
import { ProductCollectionIndicator } from "@/components/admin/shared-collections/product-collection-indicator";

interface ProductCardProps {
    product: ProductSearch;
    isSelected?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected = false }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { priceInfo, outOfStock } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});

    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <Overlay
            open={dialogState.isOpen}
            sheetClassName="min-w-[40vw]"
            showCloseButton={false}
            title="Details"
            trigger={
                <div className="group relative overflow-hidden rounded-3xl bg-card shadow-sm animate-fade-in">
                    <div className="relative aspect-product overflow-hidden">
                        <Image
                            fill
                            alt={product.name}
                            className={cn("w-full h-full object-cover duration-700 group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            src={product.images[0] || "/placeholder.jpg"}
                            onLoad={() => setImageLoaded(true)}
                        />

                        {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 dark:from-black/40 via-transparent to-transparent" />

                        <div className="absolute top-4 left-2 right-4 flex items-start justify-between">
                            <DiscountBadge discount={priceInfo.maxDiscountPercent} isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice} />
                            <ProductCollectionIndicator product={product} />
                        </div>

                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.average_rating}</span>
                        </div>

                        {outOfStock && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <Badge className="text-base px-6 py-2 backdrop-blur-sm" variant="secondary">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}

                        {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground rounded-full p-3 animate-scale-in">
                                    <Check className="w-6 h-6" />
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white md1:transform md1:translate-y-full md1:group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex justify-end mb-4">
                                <ManageSlate product={product} />
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-yellow-600">{product.name}</h3>
                                        <PriceLabel
                                            oldPriceClassName="text-gray-300"
                                            priceClassName="text-gray-100 text-base"
                                            priceInfo={priceInfo}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            onOpenChange={dialogState.setOpen}
        >
            <ProductOverview isLiked={inWishlist} product={product} onClose={dialogState.close} />
        </Overlay>
    );
};

export default ProductCard;
