import { createFileRoute } from "@tanstack/react-router";
import PromotionalBanner from "@/components/promotion";
import CategoriesSection from "@/components/store/landing/category-section";
import HeroSection from "@/components/hero-section";
import SizesGrid from "@/components/store/home/sizes-grid";
import SaleBanner from "@/components/store/sale-banner";
import ContactSection from "@/components/store/landing/contact-section";
import Featured from "@/components/store/home/featured";
import Trending from "@/components/store/home/trending";
import NewArrivals from "@/components/store/home/arrival";
import NewsletterSection from "@/components/store/landing/newsletter-section";
import CategoriesWithProductsSection from "@/components/store/home/categories-products";
import { HERO_IMAGES } from "@/utils/constants";
import { categoriesProductsQuery, indexProductsQuery } from "@/hooks/useProduct";
import { Suspense } from "react";
import { PageLoader } from "@/components/generic/page-loader";
import { ProductFeed } from "@/components/store/collections/product-feed";

export const Route = createFileRoute("/_mainLayout/")({
    component: Home,
    loader: async ({ context }) => {
        context.queryClient.fetchQuery(indexProductsQuery());
        context.queryClient.fetchQuery(categoriesProductsQuery());
        const image = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
        return {
            heroImage: image,
        };
    },
});

function Home() {
    const { heroImage } = Route.useLoaderData();

    return (
        <div className="animate-in fade-in-50 duration-300">
            <SaleBanner />
            <CategoriesSection />
            <Suspense fallback={<PageLoader variant="product-section" />}>
                <NewArrivals />
            </Suspense>
            <HeroSection image={heroImage} />
            <Suspense fallback={<PageLoader variant="product-section" />}>
                <Trending />
            </Suspense>
            <PromotionalBanner
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
                href="/collections"
            />
            <SizesGrid />
            <Suspense fallback={<PageLoader variant="product-section" />}>
                <Featured />
            </Suspense>
            <PromotionalBanner
                subtitle="Get free deliveries on order above ₦50,000."
                title="Big Sale on Top Brands!"
            />
            <Suspense fallback={<PageLoader variant="grid" rows={2} />}>
                <CategoriesWithProductsSection />
            </Suspense>
            <div className="max-w-sxl mx-auto px-2">
                <div className="px-4 mb-4">
                    <h2 className="font-display text-xl font-semibold">For You</h2>
                    <p className="text-xs text-muted-foreground">Personalized picks based on your style</p>
                </div>
                <Suspense fallback={<PageLoader variant="grid" />}>
                    <ProductFeed />
                </Suspense>
            </div>
            <ContactSection />
            <NewsletterSection />
        </div>
    );
}
