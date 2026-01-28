import type React from "react";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import { useUserCreateWishlist, useUserDeleteWishlist, useUserWishlist } from "@/hooks/useUser";
import type { Facet, ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
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
import { useInView } from "react-intersection-observer";

interface ProductCardProps {
    product: ProductSearch;
    facets?: Facet;
}

const ProductCardSocial: React.FC<ProductCardProps> = ({ product, facets }) => {
    const [ref, inView] = useInView({
        threshold: 0.6,
        rootMargin: "0px",
        triggerOnce: false,
    });

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
        <div ref={ref} className="relative h-[calc(100dvh-64px-88px)]! w-full snap-start snap-always">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-black/90 to-black/70 backdrop-blur-[2px]" />
            </div>

            <div className="absolute top-0 left-0 right-0 h-[55%]p flex items-start justify-center p-4p pt-6p">
                <img src={product.images?.[0]} alt={product.name} className="max-w-full max-h-full object-contain rounded-2xlp shadow-2xl" />
                <div className="absolute -bottom-4 left-0 right-0 h-20 bg-linear-to-t from-black/90 via-black/40 to-transparent backdrop-blur-[2px]" />
            </div>

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
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute right-3 bottom-48 flex flex-col gap-4"
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

            {/* Product details overlay */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 p-4 pb-6"
            >
                {product?.variants?.map((item: ProductVariant, idx: number) => (
                    <div key={idx} className={item.size ? "" : "hidden"}>
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex flex-col items-center justify-center mb-3 text-white font-bold">
                            <span className="text-lg leading-none">{item.size}</span>
                            <span className="text-xs leading-none">UK</span>
                        </div>
                    </div>
                ))}

                <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{product.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                    <PriceLabel priceInfo={priceInfo} priceClassName="text-white text-2xl" oldPriceClassName="text-white/50" />
                </div>
                <ProductActions product={product} />
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

    // return (
    //     <div className="product-cardp h-[calc(100dvh-36px)]!" onClick={onClick}>
    //         <motion.div
    //             initial={{ scale: 1.1 }}
    //             animate={{ scale: isActive ? 1 : 1.1 }}
    //             transition={{ duration: 0.6, ease: "easeOut" }}
    //             className="absolutep inset-0p bg-red-500"
    //         >
    //             <MediaDisplay url={product.images?.[0]} alt={product.name} className="object-contain" />
    //             <div className="bg-green-500 h-50">
    //                 jjsj skksks skkk Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore fugiat quas accusamus mollitia perferendis neque
    //                 culpa. Vero aperiam totam quisquam dolorem, nemo laborum aliquid rerum eaque amet. Vel, necessitatibus modi.
    //             </div>
    //         </motion.div>

    //         <DiscountBadge
    //             discount={priceInfo.maxDiscountPercent}
    //             isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
    //             variant="sale"
    //             className="top-4 right-4"
    //         />

    //         {isNew && <IsNew className="top-4 left-4" />}
    //         {/* Gradient Overlay */}
    //         <div className="product-overlay" />

    //         {outOfStock && (
    //             <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
    //                 <Badge className="text-sm backdrop-blur-sm" variant="contrast">
    //                     Out of Stock
    //                 </Badge>
    //             </div>
    //         )}

    //         <motion.div
    //             initial={{ opacity: 0, x: 20 }}
    //             animate={{ opacity: 1, x: 0 }}
    //             transition={{ delay: 0.3, duration: 0.4 }}
    //             className="absolute right-4 bottom-72 flex flex-col gap-5 z-20"
    //             onClick={(e) => e.stopPropagation()}
    //         >
    //             <Overlay
    //                 open={editState.isOpen}
    //                 title={
    //                     <div className="flex items-center justify-between w-full">
    //                         <h2 className="font-semibold">FILTER & SORT</h2>
    //                     </div>
    //                 }
    //                 trigger={
    //                     <motion.button whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1">
    //                         <div className="action-button bg-warning/10!">
    //                             <Filter className="w-6 h-6 transition-colors text-warning" fill="currentColor" />
    //                         </div>
    //                         <span className="text-xs font-bold text-warning/80">Filter</span>
    //                     </motion.button>
    //                 }
    //                 onOpenChange={editState.setOpen}
    //                 showHeader={true}
    //             >
    //                 <AnimatePresence mode="wait">
    //                     <motion.div
    //                         key="filter-sidebar"
    //                         initial={{ opacity: 0, x: 20 }}
    //                         animate={{ opacity: 1, x: 0 }}
    //                         exit={{ opacity: 0, x: -20 }}
    //                         className="flex-1 flex flex-col overflow-hidden"
    //                     >
    //                         <ScrollArea className="flex-1 px-6">
    //                             <FilterSidebarLogic ref={sidebarRef} facets={facets} onClose={editState.close} />
    //                         </ScrollArea>
    //                         <div className="flex justify-center gap-2 p-4 border-t border-border">
    //                             <Button className="w-full rounded-full py-6" onClick={() => sidebarRef.current?.apply()}>
    //                                 Apply
    //                             </Button>
    //                             <Button className="w-full rounded-full py-6" variant="destructive" onClick={() => sidebarRef.current?.clear()}>
    //                                 Clear
    //                             </Button>
    //                         </div>
    //                     </motion.div>
    //                 </AnimatePresence>
    //             </Overlay>
    //             <ActionButton
    //                 icon={Heart}
    //                 isActive={inWishlist}
    //                 onClick={() => {
    //                     inWishlist ? removeWishlist() : addWishlist();
    //                 }}
    //                 activeColor="text-destructive"
    //                 activeBackgroundColor="bg-destructive/20!"
    //                 label="Wishlist"
    //             />
    //             <ShareButton2 />
    //         </motion.div>
    //         <motion.div
    //             initial={{ opacity: 0, y: 40 }}
    //             animate={{ opacity: 1, y: 0 }}
    //             transition={{ delay: 0.2, duration: 0.5 }}
    //             className="relative z-10 p-6 pb-32 w-full max-w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent"
    //         >
    //             <h2 className="mb-1 font-bold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{product.name}</h2>
    //             <div className="flex items-baseline gap-2 mb-2">
    //                 <PriceLabel priceInfo={priceInfo} priceClassName="text-white text-2xl" oldPriceClassName="text-white/50" />
    //             </div>

    //             <ProductActions product={product} />

    //             {/* Sound indicator */}
    //             <div className="flex items-center gap-2 mt-4">
    //                 <Music className="w-3 h-3 text-muted-foreground" />
    //                 <div className="flex-1 h-4 overflow-hidden">
    //                     <motion.p
    //                         animate={{ x: [0, -200] }}
    //                         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    //                         className="text-xs text-muted-foreground whitespace-nowrap"
    //                     >
    //                         🎵 Trending Sound • Shop the look • Limited Edition Drop
    //                     </motion.p>
    //                 </div>
    //             </div>
    //         </motion.div>
    //     </div>
    // );
};

export default ProductCardSocial;
