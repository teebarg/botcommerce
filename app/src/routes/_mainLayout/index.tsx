import { createFileRoute } from "@tanstack/react-router";

import PromotionalBanner from "@/components/promotion";
import CategoriesSection from "@/components/store/landing/category-section";
import HeroSection from "@/components/hero-section";
import SizesGrid from "@/components/store/home/sizes-grid";
import SaleBanner from "@/components/store/sale-banner";
import { LazyInView } from "@/components/LazyInView";
import ContactSection from "@/components/store/landing/contact-section";
import Featured from "@/components/store/home/featured";
import Trending from "@/components/store/home/trending";
import RecentlyViewedSection from "@/components/store/home/recently-viewed";
import NewArrivals from "@/components/store/home/arrival";
import NewsletterSection from "@/components/store/landing/newsletter-section";

export const Route = createFileRoute("/_mainLayout/")({
    component: Home,
});

function Home() {
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
