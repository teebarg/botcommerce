import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import type { ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { IsNew } from "@/components/products/product-badges";
import { Link } from "@tanstack/react-router";
import ProductCardActions from "./product-card-actions";
import ProductTag from "./product-tag";
import ImageLightbox from "@/components/image-lightbox";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "sale" | "electric";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = "sale" }) => {
    const { priceInfo, outOfStock } = useProductVariant(product);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    return (
        <>
            <div className="shrink-0 relative cursor-pointer group w-60 md:w-72">
                <div className="relative h-80 md:h-96 rounded-xl border border-border overflow-hidden">
                    <ImageLightbox
                        url={product.image}
                        alt={product.name}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <DiscountBadge
                        discount={priceInfo.maxDiscountPercent}
                        isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                        variant={variant}
                    />
                    {isNew && <IsNew />}
                    {outOfStock && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <Badge className="text-sm backdrop-blur-sm" variant="accent-subtle">
                                Out of Stock
                            </Badge>
                        </div>
                    )}
                    <ProductTag product={product} />
                </div>

                <Link to="/products/$slug" preload={false} className="block px-1 py-2" params={{ slug: product.slug }}>
                    <h3 className="line-clamp-1 text-xs">{product.name}</h3>
                    <PriceLabel priceInfo={priceInfo} />
                </Link>

                <ProductCardActions product={product} actionColor="bg-gradient-action" />
            </div>
        </>
    );
};

export default ProductCard;
