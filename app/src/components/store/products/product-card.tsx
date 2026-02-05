import type React from "react";
import ProductActions from "./product-actions";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import type { ProductSearch, ProductVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import MediaDisplay from "@/components/media-display";
import { useMemo } from "react";
import { IsNew } from "@/components/products/product-badges";
import { useNavigate } from "@tanstack/react-router";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "sale" | "electric";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = "sale" }) => {
    const navigate = useNavigate();
    const { priceInfo, outOfStock } = useProductVariant(product);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    return (
        <div
            onClick={() => navigate({ to: `/products/${product.slug}` })}
            className="h-full shrink-0 cursor-pointer group relative bg-card flex flex-col rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover"
        >
            <div className="relative aspect-3/4 overflow-hidden">
                <MediaDisplay url={product.images?.[0]} alt={product.name} />

                <DiscountBadge discount={priceInfo.maxDiscountPercent} isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice} variant={variant} />

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
    );
};

export default ProductCard;
