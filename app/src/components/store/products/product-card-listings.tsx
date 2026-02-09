import type React from "react";
import { useInView } from "react-intersection-observer";
import type { ProductSearch } from "@/schemas/product";
import { cn } from "@/utils";
import ProductCardLight from "./product-card-light";

interface ProductCardProps {
    products: ProductSearch[];
    className?: string;
}

const ProductCardListings: React.FC<ProductCardProps> = ({ products, className }) => {
    const [ref, inView] = useInView({ triggerOnce: true });

    return (
        <div ref={ref}>
            {inView && (
                <div className={cn("grid grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4", className)}>
                    {products?.map((product) => (
                        <ProductCardLight key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductCardListings;
