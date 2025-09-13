"use client";

import React, { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/lib/hooks/useUser";
import ProductOverview from "@/components/store/products/product-overview";
import { ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageDownloadButton } from "@/components/store/image-download";

interface ProductCardProps {
    product: ProductSearch;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { priceInfo, outOfStock } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});
    const { data: session } = useSession();

    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <Overlay
            open={dialogState.isOpen}
            sheetClassName="min-w-[30vw]"
            showCloseButton={false}
            title="Details"
            trigger={
                <div className="group relative bg-content1 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                            fill
                            alt={product.name}
                            className={cn("w-full h-full object-cover duration-700 group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            src={product.sorted_images?.[0] || "/placeholder.jpg"}
                            onLoad={() => setImageLoaded(true)}
                        />

                        {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

                        <DiscountBadge
                            className="absolute top-4 left-2"
                            discount={priceInfo.maxDiscountPercent}
                            isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                        />

                        <div className="absolute top-4 right-2 flex lg:hidden flex-wrap gap-1">
                            {product?.variants?.map((item: ProductVariant, idx: number) => (
                                <Badge key={idx} className={cn(item.size ? "" : "hidden")} variant="emerald">
                                    Uk Size {item.size}
                                </Badge>
                            ))}
                        </div>

                        {outOfStock && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Badge className="text-sm backdrop-blur-sm" variant="secondary">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}

                        {session?.user?.isAdmin && (
                            <ImageDownloadButton
                                className="absolute bottom-2 left-2"
                                fallbackName={product.slug}
                                url={product.sorted_images?.[0] || ""}
                            />
                        )}
                    </div>

                    <div className="p-4">
                        <div className="hidden lg:flex items-center gap-2">
                            <p
                                className={cn(
                                    "hidden text-default-500 font-medium",
                                    product.variants?.length && product.variants?.[0].size && "inline-block"
                                )}
                            >
                                Uk Size: {product.variants?.[0].size}
                            </p>
                            <p
                                className={cn(
                                    "hidden text-default-500 font-medium",
                                    product.variants?.length && product.variants?.[0].color && "inline-block"
                                )}
                            >
                                Color: {product.variants?.[0].color}
                            </p>
                        </div>
                        <h3 className="font-bold text-default-900 mb-2 line-clamp-1">{product.name}</h3>
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
