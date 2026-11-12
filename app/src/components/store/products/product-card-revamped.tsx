import type React from "react";
import type { ProductSearch } from "@/schemas/product";
import { Link } from "@tanstack/react-router";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { defaultVariant, getPriceInfo, productOptions, variantLabel } from "@/lib/variant";
import { WishlistButton } from "./WishlistButton";
import { PriceLabel } from "../price-label";

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
    const { hasDiscount, discountLabel } = priceInfo;
    const outOfStock = !product.in_stock;
    const showDiscountBadge = !outOfStock && hasDiscount;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) {
            const isLandscape = naturalWidth > naturalHeight;
            setFitMode(isLandscape ? "contain" : "cover");
        }
        setMediaLoaded(true);
    };

    const variant = useMemo(() => defaultVariant(product), [product]);
    const hasChoices = productOptions(product).length > 0 && (product.variants?.length ?? 0) > 1;

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

                {showDiscountBadge && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-2xs font-medium px-2 py-1 rounded-full">
                        {discountLabel}
                    </span>
                )}
                {product?.is_new && (
                    <Badge
                        variant="success"
                        className={cn("absolute left-2 w-fit uppercase tracking-wider", showDiscountBadge ? "top-10" : "top-2")}
                        type="sm"
                    >
                        New
                    </Badge>
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
                    {variantLabel(variant) && !hasChoices && (
                        <Badge variant="accent" className="w-fit uppercase tracking-wider" type="sm">
                            {variantLabel(variant)}
                        </Badge>
                    )}
                    <div className="flex items-start gap-1.5">
                        <PriceLabel info={priceInfo} tone="light" />
                    </div>
                </div>
            </div>
            <AddToCartButton product={product} productVariant={variant} />
        </Link>
    );
};

export default ProductCard;
