import { Metadata } from "next";
import React from "react";

import PromotionalBanner from "@/components/promotion";
import CategoriesSection from "@/components/store/landing/category-section";
import HeroSection from "@/components/hero-section";
import SizesGrid from "@/components/store/home/sizes-grid";
import SaleBanner from "@/components/store/sale-banner";
import { LazyInView } from "@/components/LazyInView";
import { Featured, Trending, RecentlyViewedSection, NewArrivals, NewsletterSection } from "@/components/LazyClient";
import ContactSection from "@/components/store/landing/contact-section";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Home",
};

export default async function Home() {
    return (
        <div>
            <HeroSection />
            <CategoriesSection />
            <SaleBanner />
            <SizesGrid />

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <LazyInView>
                <Featured />
            </LazyInView>
            <LazyInView>
                <Trending />
            </LazyInView>
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <LazyInView>
                <RecentlyViewedSection />
            </LazyInView>
            <LazyInView>
                <NewArrivals />
            </LazyInView>
            <ContactSection />
            <LazyInView>
                <NewsletterSection />
            </LazyInView>
        </div>
    );
}
