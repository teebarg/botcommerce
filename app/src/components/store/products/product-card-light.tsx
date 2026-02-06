import type React from "react";
import { useProductVariant } from "@/hooks/useProductVariant";
import { PriceLabel } from "@/components/store/products/price-label";
import { DiscountBadge } from "@/components/store/products/discount-badge";
import type { ProductSearch } from "@/schemas/product";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

interface ProductCardProps {
    product: ProductSearch;
    variant?: "sale" | "electric";
    index?: number;
}

const ProductCardLight: React.FC<ProductCardProps> = ({ product, variant = "sale", index = 0 }) => {
    const navigate = useNavigate();
    const { priceInfo, outOfStock } = useProductVariant(product);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            viewport={{ once: true }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate({ to: `/products/${product.slug}` })}
            className="shrink-0 cursor-pointer group w-auto"
        >
            <div className="relative rounded-2xl overflow-hidden shadow-card h-60 md:h-72">
                <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <DiscountBadge discount={priceInfo.maxDiscountPercent} isFlatPrice={priceInfo.minPrice === priceInfo.maxPrice} variant={variant} />
                {outOfStock && (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <Badge className="text-sm backdrop-blur-sm" variant="contrast">
                            Out of Stock
                        </Badge>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <PriceLabel priceInfo={priceInfo} />
            </div>
        </motion.div>
    );
};

export default ProductCardLight;
