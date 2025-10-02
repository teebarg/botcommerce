"use client";

import React from "react";

import ProductsCarousel from "../product-carousel";

import ComponentLoader from "@/components/component-loader";
import ScrollableListing from "@/components/store/products/scrollable-listing";
import { useProductSearch } from "@/lib/hooks/useProduct";

export default function NewArrivals() {
    const { data, isLoading } = useProductSearch({ collections: "new-arrivals", limit: 8 });

    return (
        <section className="bg-content2">
            <div className="max-w-9xl mx-auto px-4 py-4">
                <p className="text-3xl font-bold">New Arrivals</p>
                <p className="text-default-600">Find the best thrifts for your kids</p>
                {isLoading && <ComponentLoader className="h-[400px]" />}
                <ScrollableListing products={data?.products || []} />
                <ProductsCarousel description="Find the best thrifts for your kids" products={data?.products || []} title="New Arrivals" />
            </div>
        </section>
    );
}
