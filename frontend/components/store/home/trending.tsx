"use client";

import React from "react";

import { useProductSearch } from "@/lib/hooks/useProduct";
import ProductsCarousel from "@/components/store/product-carousel";

export default function Trending() {
    const { data, isLoading } = useProductSearch({ collections: "trending", limit: 10 });

    return (
        <div className="bg-secondary text-secondary-foreground py-8 px-2">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-1 font-outfit">Trending Products</h2>
                <p className="text-xl text-muted-foreground">Discover our handpicked selection of premium products</p>
            </div>
            <ProductsCarousel isLoading={isLoading} products={data?.products || []} />
        </div>
    );
}
