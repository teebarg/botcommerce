"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import LocalizedClientLink from "@/components/ui/link";
import { ProductSearch } from "@/schemas/product";
import ProductCard from "@/components/store/products/product-card";
import { api } from "@/apis/client";

export default function Featured() {
    const { data, isLoading } = useQuery({
        queryKey: ["products", "featured"],
        queryFn: async () => {
            return await api.get<ProductSearch[]>("/product/collection/featured?limit=6");
        },
    });

    return (
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-content1 dark:to-content2 transition-colors duration-300">
            <div className="max-w-8xl mx-auto px-6">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <TrendingUp className="text-orange-500 mr-2" size={32} />
                        <h2 className="text-4xl font-bold text-default-900">Featured products</h2>
                    </div>
                    <p className="text-xl text-default-600">Handpicked selections from our premium collection</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {data?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                </div>

                <div className="text-center mt-12">
                    <LocalizedClientLink
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                        href="/collections/trending"
                    >
                        Visit Shop
                    </LocalizedClientLink>
                </div>
            </div>
        </section>
    );
}
