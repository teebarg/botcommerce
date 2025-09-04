import { Metadata } from "next";
import React from "react";

import PromotionalBanner from "@/components/promotion";
import CategoriesSection from "@/components/store/landing/category-section";
import { ContactSection } from "@/components/store/landing/contact-section";
import NewsletterSection from "@/components/store/landing/newsletter-section";
import { LazyFadeIn } from "@/components/LazyFadeIn";
import HeroSection from "@/components/hero-section";
import NewArrivals from "@/components/store/home/arrival";
import Trending from "@/components/store/home/trending";
import Featured from "@/components/store/home/featured";
import RecentlyViewedSection from "@/components/store/home/recently-viewed";

export const metadata: Metadata = {
    title: "Home",
    description: "Welcome to our store",
};

export default async function Home() {
    return (
        <div>
            <HeroSection />

            <CategoriesSection />

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <LazyFadeIn delay={100}>
                <Featured />
            </LazyFadeIn>
            <LazyFadeIn delay={200}>
                <Trending />
            </LazyFadeIn>
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <LazyFadeIn delay={200}>
                <RecentlyViewedSection />
            </LazyFadeIn>
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <LazyFadeIn delay={300}>
                <NewArrivals />
            </LazyFadeIn>
            <LazyFadeIn delay={400}>
                <ContactSection />
            </LazyFadeIn>
            <LazyFadeIn delay={500}>
                <NewsletterSection />
            </LazyFadeIn>
        </div>
    );
}
