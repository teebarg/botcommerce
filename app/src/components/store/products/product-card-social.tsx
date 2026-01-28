import type React from "react";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import { useUserCreateWishlist, useUserDeleteWishlist, useUserWishlist } from "@/hooks/useUser";
import type { Facet, ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import MediaDisplay from "@/components/media-display";
import { useMemo, useRef } from "react";
import { IsNew } from "@/components/products/product-badges";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Heart, Music } from "lucide-react";
import { ActionButton } from "../collections/action-button";
import ShareButton2 from "@/components/share2";
import Overlay from "@/components/overlay";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterSidebarLogic, FilterSidebarRef } from "../shared/filter-sidebar-logic";

interface ProductCardProps {
    product: ProductSearch;
    isActive?: boolean;
    facets?: Facet;
    onClick?: () => void;
}

const ProductCardSocial: React.FC<ProductCardProps> = ({ product, isActive, facets, onClick }) => {
    const editState = useOverlayTriggerState({});
    const { priceInfo, outOfStock } = useProductVariant(product);
    const { data } = useUserWishlist();
    const sidebarRef = useRef<FilterSidebarRef>(null);

    const inWishlist = !!data?.wishlists?.find((wishlist) => wishlist.product_id === product.id);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    const { mutate: createWishlist } = useUserCreateWishlist();
    const { mutate: deleteWishlist } = useUserDeleteWishlist();

    const addWishlist = async () => {
        createWishlist(product.id);
    };

    const removeWishlist = async () => {
        deleteWishlist(product.id);
    };

    return (
        <div className="product-card h-[calc(100dvh-36px)]!" onClick={onClick}>
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: isActive ? 1 : 1.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
            >
                <MediaDisplay url={product.images?.[0]} alt={product.name} className="object-none" />
            </motion.div>

            <DiscountBadge
                discount={priceInfo.maxDiscountPercent}
                isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                variant="sale"
                className="top-4 right-4"
            />

            {isNew && <IsNew className="top-4 left-4" />}
            {/* Gradient Overlay */}
            <div className="product-overlay" />

            {outOfStock && (
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <Badge className="text-sm backdrop-blur-sm" variant="contrast">
                        Out of Stock
                    </Badge>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute right-4 bottom-60 flex flex-col gap-5 z-20"
                onClick={(e) => e.stopPropagation()}
            >
                <Overlay
                    open={editState.isOpen}
                    title={
                        <div className="flex items-center justify-between w-full">
                            <h2 className="font-semibold">FILTER & SORT</h2>
                        </div>
                    }
                    trigger={
                        <motion.button whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1">
                            <div className="action-button bg-warning/10!">
                                <Filter className="w-6 h-6 transition-colors text-warning" fill="currentColor" />
                            </div>
                            <span className="text-xs font-bold text-warning/80">Filter</span>
                        </motion.button>
                    }
                    onOpenChange={editState.setOpen}
                    showHeader={true}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="filter-sidebar"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <ScrollArea className="flex-1 px-6">
                                <FilterSidebarLogic ref={sidebarRef} facets={facets} onClose={editState.close} />
                            </ScrollArea>
                            <div className="flex justify-center gap-2 p-4 border-t border-border">
                                <Button className="w-full rounded-full py-6" onClick={() => sidebarRef.current?.apply()}>
                                    Apply
                                </Button>
                                <Button className="w-full rounded-full py-6" variant="destructive" onClick={() => sidebarRef.current?.clear()}>
                                    Clear
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Overlay>
                <ActionButton
                    icon={Heart}
                    isActive={inWishlist}
                    onClick={() => {
                        inWishlist ? removeWishlist() : addWishlist();
                    }}
                    activeColor="text-destructive"
                    activeBackgroundColor="bg-destructive/20!"
                    label="Wishlist"
                />
                <ShareButton2 />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative z-10 p-6 pb-32 w-full max-w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            >
                <h2 className="mb-1 font-bold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{product.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                    <PriceLabel priceInfo={priceInfo} priceClassName="text-white text-2xl" oldPriceClassName="text-white/50" />
                </div>

                <ProductActions product={product} />

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
};

export default ProductCardSocial;
