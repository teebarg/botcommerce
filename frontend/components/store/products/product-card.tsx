"use client";

import React from "react";
import { Star } from "lucide-react";

import { ProductSearch } from "@/schemas/product";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import { useOverlayTriggerState } from "@react-stately/overlays";

import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ClientOnly from "@/components/generic/client-only";
import ProductOverview from "@/components/store/products/product-overview";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "bg-content1" | "bg-content2" | "bg-content3";
    size?: "sm" | "md" | "lg";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = "bg-content2", size = "md" }) => {
    const { priceInfo } = useProductVariant(product);
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
                <div role="button" tabIndex={0} className="group cursor-pointer">
                    <ClientOnly>
                        <div
                            className={`relative overflow-hidden rounded-2xl ${variant} shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
                        >
                            <DiscountBadge discount={priceInfo.maxDiscountPercent} isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice} />

                            <div
                                className={cn("relative overflow-hidden", {
                                    "h-60": size === "sm",
                                    "h-80": size === "md",
                                    "h-96": size === "lg",
                                })}
                            >
                                <Image
                                    src={product.images[0] || product.image || "/placeholder.jpg"}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    priority={false}
                                />
                            </div>

                            <div className="p-6 space-y-2">
                                <h3 className="font-semibold text-default-900 group-hover:text-yellow-600 transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{product.average_rating}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({product.review_count})</span>
                                    </div>
                                </div>
                                <PriceLabel priceInfo={priceInfo} />
                            </div>
                        </div>
                    </ClientOnly>
                </div>
            }
            onOpenChange={dialogState.setOpen}
        >
            <ProductOverview isLiked={inWishlist} product={product} onClose={dialogState.close} />
        </Overlay>
    );
};

export default ProductCard;
