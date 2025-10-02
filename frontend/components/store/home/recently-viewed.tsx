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
            <div className="bg-content3 py-8">
                <ProductsCarousel products={data || []} title="Recently Viewed" description="Your recent browsing history" />
            </div>
            {showBanner && (
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-9xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
            )}
        </>
    );
}
