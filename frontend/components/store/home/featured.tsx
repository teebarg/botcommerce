"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import { useProductSearch } from "@/lib/hooks/useProduct";
import ProductsCarousel from "@/components/store/product-carousel";

export default function Featured() {
    const { data, isLoading } = useProductSearch({ collections: "featured", limit: 10 });

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-content1 dark:to-content2 py-8">
            <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="text-orange-500 mr-2" size={32} />
                    <h2 className="text-4xl font-bold text-default-900 font-outfit">Featured products</h2>
                </div>
                <p className="text-xl text-default-600">Handpicked selections from our premium collection</p>
            </div>
            <ProductsCarousel products={data?.products || []} isLoading={isLoading} />
            <div className="text-center">
                <LocalizedClientLink
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                    href="/collections/trending"
                >
                    Visit Shop
                </LocalizedClientLink>
            </div>
        </div>
    );
}
