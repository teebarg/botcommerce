"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { ProductSearch } from "@/schemas/product";
import ProductCard from "@/components/store/products/product-card2";
import { api } from "@/apis/client";
import ComponentLoader from "@/components/component-loader";

export default function Trending() {
    const { data, isLoading } = useQuery({
        queryKey: ["products", "trending"],
        queryFn: async () => {
            return await api.get<ProductSearch[]>("/product/collection/trending?limit=4");
        },
    });

    return (
        <section className="py-16 bg-content2">
            <div className="max-w-8xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-default-foreground mb-1">Trending Products</h2>
                    <p className="text-default-600">Discover our handpicked selection of premium products</p>
                </div>
                {isLoading && <ComponentLoader className="h-[400px]" />}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {data?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                </div>
            </div>
        </section>
    );
}
