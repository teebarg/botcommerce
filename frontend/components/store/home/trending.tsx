"use client";

import React from "react";

import { useProductSearch } from "@/lib/hooks/useProduct";
import ProductsCarousel from "@/components/store/product-carousel";

export default function Trending() {
    const { data, isLoading } = useProductSearch({ collections: "trending", limit: 10 });

    return (
        <div className="bg-content2 py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-default-foreground mb-1 font-outfit">Trending Products</h2>
                <p className="text-xl text-default-600">Discover our handpicked selection of premium products</p>
            </div>
            <ProductsCarousel products={data?.products || []} isLoading={isLoading} />
        </div>
    );
}
