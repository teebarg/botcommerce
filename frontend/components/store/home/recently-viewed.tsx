"use client";

import React from "react";

import { useUserRecentlyViewed } from "@/lib/hooks/useUser";
import PromotionalBanner from "@/components/promotion";
import ProductsCarousel from "@/components/store/product-carousel";

interface RecentlyViewedSectionProps {
    limit?: number;
    showBanner?: boolean;
}

export default function RecentlyViewedSection({ limit = 5, showBanner = true }: RecentlyViewedSectionProps) {
    const { data, isLoading } = useUserRecentlyViewed(limit);

    if (!data || data.length === 0 || isLoading) return null;

    return (
        <>
            <div className="py-8 px-2 bg-gradient-to-b from-card/30 to-background">
                <ProductsCarousel description="Your recent browsing history" products={data || []} title="Recently Viewed" />
            </div>
            {showBanner && (
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
            )}
        </>
    );
}
