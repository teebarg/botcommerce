import type React from "react";
import { useInView } from "react-intersection-observer";
import type { ProductSearch } from "@/schemas/product";
import { cn } from "@/utils";
import ProductCard from "@/components/store/products/product-card";

interface ProductCardProps {
    products: ProductSearch[];
    className?: string;
    viewMode?: "grid" | "list";
}

const ProductCardListings: React.FC<ProductCardProps> = ({ products, className, viewMode }) => {
    const [ref, inView] = useInView({ triggerOnce: true });

    return (
        <div ref={ref}>
            {inView && (
                <div className={cn("grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4", viewMode === "list" && "grid-cols-1", className)}>
                    {products?.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductCardListings;
