"use client";

import React from "react";

import ProductsCarousel from "../product-carousel";

import { useProductSearch } from "@/hooks/useProduct";

export default function NewArrivals() {
    const { data, isLoading } = useProductSearch({ collections: "new-arrivals", limit: 10 });

    return (
        <div className="bg-linear-to-b from-background to-card/30 py-8 px-2">
            <ProductsCarousel
                description="Find the best thrifts for your kids"
                isLoading={isLoading}
                products={data?.products || []}
                title="New Arrivals"
            />
        </div>
    );
}
