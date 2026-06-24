import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import type { ProductSearch } from "@/schemas/product";
import { Link } from "@tanstack/react-router";
import ProductCardActions from "./product-card-actions";
import { useMemo } from "react";
import ProductTag from "./product-tag";
import { IsNew } from "@/components/products/product-badges";
import ImageLightbox from "@/components/image-lightbox";

interface ProductCardProps {
    product: ProductSearch;
}

const ProductCardPLP: React.FC<ProductCardProps> = ({ product }) => {
    const { priceInfo, outOfStock } = useProductVariant(product);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    return (
        <div className="relative group cursor-pointer bg-card animate-in fade-in duration-300 rounded-xl border border-border overflow-hidden flex flex-col justify-between">
            <div className="relative w-full aspect-product overflow-hidden">
                {Boolean(priceInfo.maxDiscountPercent) && (
                    <div className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground px-2 py-1 text-xxs font-bold rounded-sm">
                        -{priceInfo.maxDiscountPercent}%
                    </div>
                )}
                {isNew && (
                    <div className="absolute top-2 right-2 z-10">
                        <IsNew />
                    </div>
                )}

                <ImageLightbox
                    url={product.image}
                    alt={product.name}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                />

                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                        <span className="bg-foreground text-background px-4 py-2 text-xxs font-bold uppercase tracking-[0.2em]">
                            Sold Out
                        </span>
                    </div>
                )}
                <ProductTag product={product} />
            </div>

            <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                <Link
                    to="/products/$slug"
                    preload={false}
                    className="flex flex-col gap-1"
                    params={{ slug: product?.slug }}
                >
                    <h3 className="line-clamp-2 text-xs font-medium tracking-wide text-foreground/90 group-hover:text-primary transition-colors truncate">
                        {product?.name}
                    </h3>
                    <PriceLabel priceInfo={priceInfo} />
                </Link>

                <div className="pt-1.5 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    <ProductCardActions product={product} actionColor="bg-gradient-action" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardPLP;