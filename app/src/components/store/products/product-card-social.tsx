import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/hooks/useUser";
import ProductOverview from "@/components/store/products/product-overview";
import type { ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import MediaDisplay from "@/components/media-display";
import { useMemo } from "react";
import { IsNew } from "@/components/products/product-badges";
import { motion } from "framer-motion";
import { Heart, Share2, ShoppingBag, Music, Verified } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
    product: ProductSearch;
    banner?: "sale" | "electric";
    isActive?: boolean;
    variant?: "mobile" | "desktop";
    onClick?: () => void;
}

const ProductCardSocial: React.FC<ProductCardProps> = ({ product, banner = "sale", isActive, variant, onClick }) => {
    const { priceInfo, outOfStock } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});
    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    return (
        <div className="product-card" onClick={onClick}>
            {/* Product Image */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: isActive ? 1 : 1.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
            >
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {/* <MediaDisplay url={product.images?.[0]} alt={product.name} /> */}
            </motion.div>

            {/* Gradient Overlay */}
            <div className="product-overlay" />

            {/* Progress Bar at Top */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-20 flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full ${i === (product.id - 1) % 5 ? "bg-foreground" : "bg-foreground/30"
                            }`}
                    />
                ))}
            </div>

            {/* Side Actions */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute right-4 bottom-40 flex flex-col gap-5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* <ActionButton
                    icon={Heart}
                    count={likeCount}
                    isActive={liked}
                    onClick={() => {
                        setLiked(!liked);
                        setLikeCount(prev => liked ? prev - 1 : prev + 1);
                    }}
                    activeColor="text-primary"
                />
                <ActionButton
                    icon={Share2}
                    count={product.shares}
                /> */}
            </motion.div>

            {/* Product Info */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative z-10 p-6 pb-32 w-full max-w-[calc(100%-80px)]"
            >
                {/* Brand */}
                {/* <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold">
                        {product.brand.charAt(0)}
                    </div>
                    <span className="font-semibold text-foreground">{product.brand}</span>
                    {product.isVerified && (
                        <Verified className="w-4 h-4 text-primary" fill="currentColor" />
                    )}
                </div> */}

                {/* Product Name & Description */}
                <h2 className="text-xl font-bold text-foreground mb-1">{product.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                </p>

                {/* Tags */}
                {/* {product.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {product.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-xs text-primary font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )} */}

                {/* Price & CTA */}
                <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-2">
                        <PriceLabel priceInfo={priceInfo} />
                        {/* <span className="text-2xl font-bold text-foreground">
                            ${product.price}
                        </span>
                        {product.originalPrice && (
                            <>
                                <span className="text-sm text-muted-foreground line-through">
                                    ${product.originalPrice}
                                </span>
                                <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                                    -{discount}%
                                </span>
                            </>
                        )} */}
                    </div>
                </div>

                {/* Buy Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    className="mt-4 w-full gradient-primary text-primary-foreground font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                    style={{ boxShadow: "0 8px 32px hsl(350 89% 60% / 0.4)" }}
                >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Bag
                </motion.button>

                {/* Sound indicator */}
                <div className="flex items-center gap-2 mt-4">
                    <Music className="w-3 h-3 text-muted-foreground" />
                    <div className="flex-1 h-4 overflow-hidden">
                        <motion.p
                            animate={{ x: [0, -200] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="text-xs text-muted-foreground whitespace-nowrap"
                        >
                            🎵 Trending Sound • Shop the look • Limited Edition Drop
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        </div>
    );

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
                            variant={banner}
                        />

                        {isNew && <IsNew />}

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

export default ProductCardSocial;
