"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";

import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ProductOverview from "@/components/store/products/product-overview";
import { ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { ProductCollectionIndicator } from "@/components/admin/shared-collections/product-collection-indicator";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: ProductSearch;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
                <div className="group relative bg-gray-100 dark:bg-black rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                            fill
                            alt={product.name}
                            className={cn("w-full h-full object-cover duration-700 group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            src={product.images?.[0] || "/placeholder.jpg"}
                            onLoad={() => setImageLoaded(true)}
                        />

                        {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

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
                    </div>

                    <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">{product.category_slugs?.[0]}</p>
                        <h3 className="font-medium text-card-foreground mb-2 line-clamp-2">{product.name}</h3>
                        <PriceLabel priceInfo={priceInfo} />
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
