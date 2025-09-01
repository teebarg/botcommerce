"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { ProductSearch } from "@/schemas/product";
import ProductCard from "@/components/store/products/product-card";
import { api } from "@/apis/client";
import ComponentLoader from "@/components/component-loader";

export default function NewArrivals() {
    const { data, isLoading } = useQuery({
        queryKey: ["products", "new-arrivals"],
        queryFn: async () => {
            return await api.get<ProductSearch[]>("/product/collection/new-arrivals?limit=4");
        },
    });

    return (
        <section className="bg-content1">
            <div className="max-w-8xl mx-auto p-6">
                <p className="text-3xl font-bold">New Arrivals</p>
                <p className="text-default-600">Find the best thrifts for your kids</p>
                {isLoading && <ComponentLoader className="h-[400px]" />}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {data?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                </div>
            </div>
        </section>
    );
}
