"use client";

import React from "react";

import ComponentLoader from "@/components/component-loader";
import { useProductSearch } from "@/lib/hooks/useProduct";
import ScrollableListing from "@/components/store/products/scrollable-listing";

export default function Trending() {
    const { data, isLoading } = useProductSearch({ collections: "trending", limit: 5 });

    return (
        <section className="py-16 bg-content2">
            <div className="max-w-8xl mx-auto px-2">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-default-foreground mb-1">Trending Products</h2>
                    <p className="text-default-600">Discover our handpicked selection of premium products</p>
                </div>
                {isLoading && <ComponentLoader className="h-[400px]" />}
                <ScrollableListing products={data?.products || []} />
            </div>
        </section>
    );
}
