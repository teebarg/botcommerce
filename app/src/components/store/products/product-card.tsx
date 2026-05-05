import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import type { ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import MediaDisplay from "@/components/media-display";
import { useMemo, useState } from "react";
import { IsNew } from "@/components/products/product-badges";
import { Link } from "@tanstack/react-router";
import ProductCardActions from "./product-card-actions";
import ImageLightbox from "@/components/ImageLightbox";
import ProductTag from "./product-tag";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "sale" | "electric";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = "sale" }) => {
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const { priceInfo, outOfStock } = useProductVariant(product);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    return (
        <>
            <div className="shrink-0 relative cursor-pointer group w-60 md:w-72">
                <div onClick={() => setLightboxOpen(true)} className="relative rounded-2xl overflow-visible h-80 md:h-96">
                    <MediaDisplay url={product.image} alt={product.name} />
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

                <Link to="/products/$slug" className="block px-1 py-2" params={{ slug: product.slug }}>
                    <h3 className="line-clamp-1 text-xs">{product.name}</h3>
                    <PriceLabel priceInfo={priceInfo} />
                </Link>

                <ProductCardActions product={product} actionColor="bg-gradient-action" />
            </div>
            <ImageLightbox image={lightboxOpen ? product.image : null} onClose={() => setLightboxOpen(false)} />
        </>
    );
};

export default ProductCard;
