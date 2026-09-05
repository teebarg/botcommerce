import type React from "react";
import type { ProductSearch } from "@/schemas/product";
import { Link } from "@tanstack/react-router";
import { currency } from "@/utils";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { defaultVariant, getPriceInfo, variantLabel } from "@/lib/variant";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
    product: ProductSearch;
    className?: string;
    onClick?: () => void;
}

type FitMode = "cover" | "contain";

const ProductCard: React.FC<ProductCardProps> = ({ product, className, onClick }) => {
    const [fitMode, setFitMode] = useState<FitMode>("cover");
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
    const priceInfo = useMemo(() => getPriceInfo(product), [product]);
    const { minPrice, maxCompareAtPrice, hasDiscount, maxDiscountPercent } = priceInfo;
    const outOfStock = !product.in_stock;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) {
            const isLandscape = naturalWidth > naturalHeight;
            setFitMode(isLandscape ? "contain" : "cover");
        }
        setMediaLoaded(true);
    };

    const variant = useMemo(() => defaultVariant(product), [product]);

    return (
        <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className={cn("block w-full rounded-xl overflow-hidden border border-border group", className)}
            preload={false}
        >
            <div className="relative aspect-gallery">
                <div
                    onClick={(e) => {
                        if (outOfStock) return;
                        e.stopPropagation();
                        e.preventDefault();
                        onClick?.();
                    }}
                    className="relative w-full h-full overflow-hidden bg-muted"
                >
                    {!mediaLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full object-cover" />}
                    <img
                        alt={product?.name || ""}
                        src={product?.image}
                        onLoad={handleImageLoad}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                            "w-full h-full transition-opacity duration-500",
                            fitMode === "cover" ? "object-cover" : "object-contain",
                            mediaLoaded ? "opacity-100" : "opacity-0",
                            outOfStock ? "cursor-pointer" : "cursor-zoom-in"
                        )}
                    />
                </div>

                {!outOfStock && hasDiscount && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-2xs font-medium px-2 py-1 rounded-full">
                        -{maxDiscountPercent}%
                    </span>
                )}
                {!outOfStock && !hasDiscount && product.is_new && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-2xs font-medium px-2 py-1 rounded-full">New</span>
                )}

                {product.in_stock && <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3" />}

                {outOfStock && (
                    <>
                        <div className="absolute inset-0 bg-black/55" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-foreground text-background text-2xs font-medium px-3.5 py-1.5 rounded-full tracking-wide">
                                Sold out
                            </span>
                        </div>
                    </>
                )}

                <div
                    className={cn(
                        "absolute bottom-0 inset-x-0 pt-4 pb-2 px-2 bg-gradient-to-t",
                        outOfStock ? "from-black/40 to-transparent" : "from-black/80 via-black/40 to-transparent"
                    )}
                >
                    <div className="sr-only">{product.name}</div>
                    {product?.is_new && (
                        <Badge variant="destructive" className="w-fit uppercase tracking-wider" type="sm">
                            New
                        </Badge>
                    )}
                    {variantLabel(variant) && (
                        <Badge variant="accent" className="w-fit uppercase tracking-wider" type="sm">
                            {variantLabel(variant)}
                        </Badge>
                    )}
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-white text-lg font-medium drop-shadow-sm">{currency(minPrice)}</span>
                        {!outOfStock && hasDiscount && <span className="text-white/55 text-sm line-through">{currency(maxCompareAtPrice)}</span>}
                    </div>
                </div>
            </div>
            <AddToCartButton product={product} productVariant={variant} />
        </Link>
    );
};

export default ProductCard;
