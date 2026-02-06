import type React from "react";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import { useUserCreateWishlist, useUserDeleteWishlist, useUserWishlist } from "@/hooks/useUser";
import type { Facet, ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { useMemo, useRef, useState } from "react";
import { IsNew } from "@/components/products/product-badges";
import { Filter, Heart, Music } from "lucide-react";
import Overlay from "@/components/overlay";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterSidebarLogic, FilterSidebarRef } from "../shared/filter-sidebar-logic";
import { useInView } from "react-intersection-observer";
import { cn } from "@/utils";
import ShareButton from "@/components/share";

interface ProductCardProps {
    product: ProductSearch;
    facets?: Facet;
    scrollRef?: React.RefObject<HTMLElement | null>;
}

const ProductCardSocial: React.FC<ProductCardProps> = ({ product, facets, scrollRef }) => {
    const [ref, inView] = useInView({
        root: scrollRef?.current,
        threshold: 0.6,
        triggerOnce: true,
    });
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const filterState = useOverlayTriggerState({});
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
        <div ref={ref} className="relative h-[calc(100dvh-64px-88px)]! w-full snap-start snap-always bg-[#121212]">
            <div className="absolute inset-0 bg-[#121212]" />
            <div className="absolute top-0 left-0 right-0 flex items-start justify-center">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-start justify-center">
                        <div
                            className="max-w-full max-h-[70vh] w-full aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse"
                            style={{ maxHeight: "70vh" }}
                        />
                    </div>
                )}

                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="max-w-full max-h-[70vh] object-contain fade-to-black transition-opacity duration-300 opacity-0 data-[loaded=true]:opacity-100"
                    loading="lazy"
                    data-loaded={imageLoaded}
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    style={{
                        contentVisibility: "auto",
                        willChange: "opacity",
                    }}
                />
            </div>

            <DiscountBadge
                discount={priceInfo.maxDiscountPercent}
                isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                variant="sale"
                className="top-4 right-4"
            />

            {isNew && <IsNew className="top-4 left-4" />}
            {outOfStock && (
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <Badge className="text-sm backdrop-blur-sm" variant="contrast">
                        Out of Stock
                    </Badge>
                </div>
            )}

            <div
                className="absolute right-4 bottom-32 space-y-4 z-20"
                style={{
                    opacity: inView && imageLoaded ? 1 : 0,
                    transform: inView && imageLoaded ? "translateX(0)" : "translateX(20px)",
                    transition: "opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s",
                    willChange: "opacity, transform",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Overlay
                    open={filterState.isOpen}
                    title={
                        <div className="flex items-center justify-between w-full">
                            <h2 className="font-semibold">FILTER & SORT</h2>
                        </div>
                    }
                    trigger={
                        <button className="flex flex-col items-center gap-1 text-white/80">
                            <div className="action-button">
                                <Filter className="w-6 h-6 transition-colors" fill="currentColor" />
                            </div>
                            <span className="text-xs font-bold">Filter</span>
                        </button>
                    }
                    onOpenChange={filterState.setOpen}
                    side="left"
                >
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1 px-6">
                            <FilterSidebarLogic ref={sidebarRef} facets={facets} onClose={filterState.close} />
                        </ScrollArea>
                        <div className="flex justify-center gap-2 p-4 border-t border-border">
                            <Button className="w-full rounded-full py-6" onClick={() => sidebarRef.current?.apply()}>
                                Apply
                            </Button>
                            <Button className="w-full rounded-full py-6" variant="destructive" onClick={() => sidebarRef.current?.clear()}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </Overlay>
                <button
                    onClick={() => {
                        inWishlist ? removeWishlist() : addWishlist();
                    }}
                    className="flex flex-col items-center gap-1 text-white/80"
                >
                    <div className={cn("action-button", inWishlist ? "bg-destructive/20!" : "")}>
                        <Heart
                            className={`w-6 h-6 transition-colors ${inWishlist ? "text-destructive" : "text-white/80"}`}
                            fill={inWishlist ? "currentColor" : "none"}
                        />
                    </div>
                    <span className={`text-xs font-bold ${inWishlist ? "text-destructive" : "text-white/80"}`}>Wishlist</span>
                </button>
                <ShareButton />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {product?.variants?.map((item: ProductVariant) => (
                    <div key={item.id} className={item.size ? "" : "hidden"}>
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex flex-col items-center justify-center mb-3 text-white font-bold">
                            <span className="text-lg leading-none">{item.size}</span>
                            <span className="text-xs leading-none">UK</span>
                        </div>
                    </div>
                ))}

                <h2 className="font-bold text-white mb-2 line-clamp-2 pr-24">{product.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                    <PriceLabel priceInfo={priceInfo} priceClassName="text-white text-2xl" oldPriceClassName="text-white/50" />
                </div>
                <ProductActions product={product} actionColor="bg-gradient-action" />
                <div className="flex items-center gap-2 mt-4">
                    <Music className="w-3 h-3 text-muted-foreground" />
                    <div className="flex-1 h-4 overflow-hidden relative">
                        <div className="whitespace-nowrap animate-marquee text-xs text-white/70">
                            🎵 Trending Styles • Shop the look • Limited Edition Drop
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSocial;
