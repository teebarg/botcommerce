import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import type { ProductSearch, SearchVariant } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import MediaDisplay from "@/components/media-display";
import { useMemo, useState } from "react";
import { IsNew } from "@/components/products/product-badges";
import { Link } from "@tanstack/react-router";
import ProductCardActions from "./product-card-actions";
import ImageLightbox from "@/components/ImageLightbox";

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
            <div className="shrink-0 cursor-pointer group w-60 md:w-72">
                <div onClick={() => setLightboxOpen(true)} className="relative rounded-2xl overflow-hidden shadow-card h-80 md:h-96">
                    <MediaDisplay url={product.images?.[0]} alt={product.name} className="transition-transform duration-500 group-hover:scale-110" />
                    <DiscountBadge
                        discount={priceInfo.maxDiscountPercent}
                        isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice}
                        variant={variant}
                    />
                    {isNew && <IsNew />}
                    {product?.variants?.[0]?.age && (
                        <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border shadow-md">
                            {product?.variants?.[0]?.age}
                        </div>
                    )}

                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                        {product?.variants?.map((item: SearchVariant, idx: number) => (
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
                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <Link to="/products/$slug" className="block px-1 py-2" params={{ slug: product.slug }}>
                    <h3 className="line-clamp-1 text-xs">{product.name}</h3>
                    <PriceLabel priceInfo={priceInfo} />
                </Link>

                <ProductCardActions product={product} actionColor="bg-gradient-action" />
            </div>
            <ImageLightbox image={lightboxOpen ? product.images?.[0] : null} onClose={() => setLightboxOpen(false)} />
        </>
    );
};

export default ProductCard;
