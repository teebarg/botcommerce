"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ProductOverview from "@/components/store/products/product-overview";
import { ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MediaDisplay from "@/components/media-display";

interface ProductCardProps {
    product: ProductSearch;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { priceInfo, outOfStock } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});
    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <Overlay
            open={dialogState.isOpen}
            sheetClassName="min-w-[30vw]"
            showCloseButton={false}
            title="Details"
            trigger={
                <div className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="relative aspect-3/4 overflow-hidden">
                        <MediaDisplay url={product.images?.[0]} alt={product.name} />

                        <DiscountBadge
                            className="absolute top-4 left-2"
                            discount={priceInfo.maxDiscountPercent}
                            isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                        />

                        <div className="absolute top-4 right-2 flex flex-wrap gap-1">
                            {product?.variants?.map((item: ProductVariant, idx: number) => (
                                <Badge key={idx} className={cn(item.size ? "" : "hidden")} variant="emerald">
                                    UK: {item.size}
                                </Badge>
                            ))}
                        </div>

                        {product?.variants?.[0]?.age && (
                            <div className="absolute top-4 right-2 flex flex-wrap gap-1">
                                <Badge variant="emerald">{product?.variants?.[0]?.age}</Badge>
                            </div>
                        )}

                        {outOfStock && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Badge className="text-sm backdrop-blur-sm" variant="contrast">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="py-4 px-2 space-y-2">
                        <p className="sr-only">{product.name}</p>
                        <PriceLabel priceInfo={priceInfo} />
                        <ProductActions product={product} />
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
