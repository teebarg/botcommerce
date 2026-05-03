import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import type { ProductSearch } from "@/schemas/product";
import { Link } from "@tanstack/react-router";
import ProductCardActions from "./product-card-actions";
import { useMemo, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import ProductTag from "./product-tag";
import { IsNew } from "@/components/products/product-badges";
import ImageDisplay from "@/components/image-display";

interface ProductCardProps {
    product: ProductSearch;
}

const ProductCardPLP: React.FC<ProductCardProps> = ({ product }) => {
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const { priceInfo, outOfStock } = useProductVariant(product);
    const isNew = useMemo(() => !!product?.is_new, [product]);

    return (
        <>
            <div className="relative group cursor-pointer bg-background animate-in fade-in duration-300">
                {Boolean(priceInfo.maxDiscountPercent) && (
                    <div className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground px-2 py-1 text-xxs font-bold">
                        -{priceInfo.maxDiscountPercent}%
                    </div>
                )}

                <div
                    className="relative overflow-hidden"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}
                    onClick={() => setLightboxOpen(true)}
                >
                    <ImageDisplay src={product?.image} alt={product?.name} className="min-h-60 max-h-[400px]" />
                    {isNew && <IsNew />}
                    {outOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-foreground text-background px-4 py-2 text-xxs font-bold uppercase tracking-[0.2em]">
                                Sold Out
                            </span>
                        </div>
                    )}
                    <ProductTag product={product} />
                </div>
                <Link to="/products/$slug" className="block px-1 py-2" params={{ slug: product?.slug }}>
                    <h3 className="line-clamp-1 text-xs">{product?.name}</h3>
                    <PriceLabel priceInfo={priceInfo} />
                </Link>

                <ProductCardActions product={product} actionColor="bg-gradient-action" />
            </div>
            <ImageLightbox image={lightboxOpen ? product?.image : null} onClose={() => setLightboxOpen(false)} />
        </>
    );
};

export default ProductCardPLP;