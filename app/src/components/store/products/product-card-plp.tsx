import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import type { ProductSearch } from "@/schemas/product";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import ProductCardActions from "./product-card-actions";
import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

interface ProductCardProps {
    product: ProductSearch;
    index?: number;
}

const ProductCardPLP: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const { priceInfo, outOfStock } = useProductVariant(product);

    return (
        <>
            <motion.div
                className="relative group overflow-hidden bg-background"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
            >
                {Boolean(priceInfo.maxDiscountPercent) && (
                    <div className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground px-2 py-1 text-[10px] font-bold tracking-tighter">
                        -{priceInfo.maxDiscountPercent}%
                    </div>
                )}

                <div
                    className="relative aspect-[3/4] overflow-hidden bg-secondary"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}
                    onClick={() => setLightboxOpen(true)}
                >
                    <img
                        src={product.images?.[0] || "/placeholder.jpg"}
                        className="object-cover w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
                        alt={product.name}
                        loading="lazy"
                    />
                    {outOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-foreground text-background px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]">Sold Out</span>
                        </div>
                    )}
                </div>
                <Link to="/products/$slug" className="block px-1" params={{ slug: product.slug }}>
                    <h3 className="line-clamp-1 text-sm">{product.name}</h3>
                    <PriceLabel priceInfo={priceInfo} />
                </Link>

                <ProductCardActions product={product} actionColor="bg-gradient-action" />
            </motion.div>
            <ImageLightbox image={lightboxOpen ? product.images?.[0] : null} onClose={() => setLightboxOpen(false)} />
        </>
    );
};

export default ProductCardPLP;
