"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/hooks/useUser";
import ProductOverview from "@/components/store/products/product-overview";
import { ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MediaDisplay from "@/components/media-display";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "sale" | "electric";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = "sale" }) => {
    const { priceInfo, outOfStock } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});
    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <Overlay
            open={dialogState.isOpen}
            sheetClassName="min-w-[30vw]"
            title="Details"
            trigger={
                <div className="h-full group relative bg-card flex flex-col rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="relative aspect-3/4 overflow-hidden">
                        <MediaDisplay url={product.images?.[0]} alt={product.name} />

                        <DiscountBadge
                            discount={priceInfo.maxDiscountPercent}
                            isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                            variant={variant}
                        />

                        {product?.variants?.[0]?.age && (
                            <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border shadow-md">
                                {product?.variants?.[0]?.age}
                            </div>
                        )}

                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                            {product?.variants?.map((item: ProductVariant, idx: number) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        item.size
                                            ? "bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border shadow-md"
                                            : "hidden"
                                    )}
                                >
                                    UK: {item.size}
                                </div>
                            ))}
                        </div>

                        {outOfStock && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Badge className="text-sm backdrop-blur-sm" variant="contrast">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="py-4 px-2 space-y-2 flex flex-col flex-1">
                        <div className="flex-1">
                            <p className="sr-only">{product.name}</p>
                            <PriceLabel priceInfo={priceInfo} />
                        </div>
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
