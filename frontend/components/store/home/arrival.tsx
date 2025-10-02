"use client";

import React from "react";

import ProductsCarousel from "../product-carousel";
import { useProductSearch } from "@/lib/hooks/useProduct";

export default function NewArrivals() {
    const { data, isLoading } = useProductSearch({ collections: "new-arrivals", limit: 10 });

    return (
        <div className="bg-content2 py-8">
            <ProductsCarousel
                description="Find the best thrifts for your kids"
                products={data?.products || []}
                title="New Arrivals"
                isLoading={isLoading}
            />
        </div>
    );
}
