import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import Overlay from "@/components/overlay";
import { useUserWishlist } from "@/hooks/useUser";
import type { ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductOverview from "./product-overview";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "sale" | "electric";
    index?: number;
    compact?: boolean;
}

const ProductCardLight: React.FC<ProductCardProps> = ({ product, variant = "sale", index = 0, compact = false }) => {
    const isMobile = useIsMobile();
    const { priceInfo, outOfStock } = useProductVariant(product);
    const dialogState = useOverlayTriggerState({});
    const { data } = useUserWishlist();

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);

    return (
        <Overlay
            sheetClassName="h-[100dvh]!"
            open={dialogState.isOpen}
            trigger={
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    viewport={{ once: true }}
                    whileTap={{ scale: 0.98 }}
                    className={`shrink-0 cursor-pointer group ${compact ? "w-44" : "w-auto"}`}
                >
                    <div className={`relative rounded-2xl overflow-hidden shadow-card ${compact ? "h-52" : "h-60"}`}>
                        <img
                            src={product.images?.[0] || "/placeholder.jpg"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <DiscountBadge
                            discount={priceInfo.maxDiscountPercent}
                            isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                            variant={variant}
                        />
                        {outOfStock && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Badge className="text-sm backdrop-blur-sm" variant="contrast">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="mt-3 space-y-1">
                        <h3 className="text-sm font-medium truncate">{product.name}</h3>
                        <PriceLabel priceInfo={priceInfo} />
                    </div>
                </motion.div>
            }
            onOpenChange={dialogState.setOpen}
            side={isMobile ? "bottom" : "right"}
        >
            <ProductOverview isLiked={inWishlist} product={product} onClose={dialogState.close} />
        </Overlay>
    );
};

export default ProductCardLight;
