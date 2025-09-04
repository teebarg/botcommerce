"use client";

import React from "react";
import { Eye } from "lucide-react";

import { useUserRecentlyViewed } from "@/lib/hooks/useUser";
import { ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card";

export default function RecentlyViewedSection() {
    const { data } = useUserRecentlyViewed(4);

    if (!data || data.length === 0) return null;

    return (
        <section className="py-16">
            <div className="max-w-8xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Recently Viewed</h2>
                        <p className="text-muted-foreground text-sm">
                            {data?.length} item{data?.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {data?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                </div>
            </div>
        </section>
    );
}
