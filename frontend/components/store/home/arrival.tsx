"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { ProductSearch } from "@/schemas/product";
import { api } from "@/apis/client";
import ComponentLoader from "@/components/component-loader";
import ScrollableListing from "@/components/store/products/scrollable-listing";

export default function NewArrivals() {
    const { data, isLoading } = useQuery({
        queryKey: ["products", "new-arrivals"],
        queryFn: async () => {
            return await api.get<ProductSearch[]>("/product/collection/new-arrivals?limit=5");
        },
    });

    return (
        <section className="bg-content2">
            <div className="max-w-9xl mx-auto px-4 py-4">
                <p className="text-3xl font-bold">New Arrivals</p>
                <p className="text-default-600">Find the best thrifts for your kids</p>
                {isLoading && <ComponentLoader className="h-[400px]" />}
                <ScrollableListing products={data || []} />
            </div>
        </section>
    );
}
