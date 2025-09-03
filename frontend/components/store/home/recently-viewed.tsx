"use client";

import React from "react";
import { RecentlyViewed } from "@/components/generic/recently-viewed/recently-viewed";
import { useUserRecentlyViewed } from "@/lib/hooks/useUser";

export default function RecentlyViewedSection() {
    const { data } = useUserRecentlyViewed();

    if (!data || data.length === 0) return null;
    return (
        <section className="py-16">
            <div className="max-w-8xl mx-auto">
                <RecentlyViewed products={data} />
            </div>
        </section>
    );
}
