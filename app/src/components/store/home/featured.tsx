"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import { useProductSearch } from "@/hooks/useProduct";
import ProductsCarousel from "@/components/store/product-carousel";

export default function Featured() {
    const { data, isLoading } = useProductSearch({ collections: "featured", limit: 10 });

    return (
        <div className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-background dark:to-secondary py-8 px-2">
            <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="text-orange-500 mr-2" size={32} />
                    <h2 className="text-4xl font-bold font-outfit">Featured products</h2>
                </div>
                <p className="text-xl text-muted-foreground">Handpicked selections from our premium collection</p>
            </div>
            <ProductsCarousel isLoading={isLoading} products={data?.products || []} />
            <div className="text-center">
                <LocalizedClientLink
                    className="bg-linear-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 mt-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 inline-block"
                    href="/collections/trending"
                >
                    Visit Shop
                </LocalizedClientLink>
            </div>
        </div>
    );
}
