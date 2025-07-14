"use client";

import React from "react";
import { ProductSearch } from "@/schemas/product";
import { useInView } from "react-intersection-observer";
import ProductCard from "./product-card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    products: ProductSearch[];
    sm?: "grid-cols-1" | "grid-cols-2" | "grid-cols-3" | "grid-cols-4";
    md?: "grid-cols-1" | "grid-cols-2" | "grid-cols-3" | "grid-cols-4";
    lg?: "grid-cols-1" | "grid-cols-2" | "grid-cols-3" | "grid-cols-4";
    className?: string;
}

const ProductCardListings: React.FC<ProductCardProps> = ({ products, sm, md, lg, className }) => {
    const [ref, inView] = useInView({ triggerOnce: true });

    return (
        <div ref={ref}>
            {inView && (
                <div className={cn("grid grid-cols-1 gap-4", className, sm && `sm:${sm}`, md && `md:${md}`, lg && `lg:${lg}`)}>
                    {products.map((product, idx) => (
                        <ProductCard key={idx} product={product} variant="bg-content1" />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductCardListings;
