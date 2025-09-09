"use client";

import React from "react";
import { Eye } from "lucide-react";

import { useUserRecentlyViewed } from "@/lib/hooks/useUser";
import PromotionalBanner from "@/components/promotion";
import ScrollableListing from "@/components/store/products/scrollable-listing";

export default function RecentlyViewedSection() {
    const { data } = useUserRecentlyViewed(5);

    if (!data || data.length === 0) return null;

    return (
        <section className="py-16 px-6">
            <div className="max-w-9xl mx-auto">
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
                <ScrollableListing products={data || []} />
            </div>
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-9xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
        </section>
    );
}
