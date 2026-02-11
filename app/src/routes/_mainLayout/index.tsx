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
import InfiniteFeed from "@/components/store/collections/infinite-feed";
import { indexCategoriesProductsQuery, indexProductQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_mainLayout/")({
    component: Home,
    loader: async ({ context: { queryClient } }) => {
        await Promise.all([queryClient.ensureQueryData(indexProductQuery()), queryClient.ensureQueryData(indexCategoriesProductsQuery())]);
        const image = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
        return {
            heroImage: image,
        };
    },
});

function Home() {
    const { data } = useSuspenseQuery(indexProductQuery());
    const loaderData = Route.useLoaderData();

    return (
        <div>
            <HeroSection image={loaderData.heroImage} />
            <CategoriesSection />
            <SaleBanner />
            <SizesGrid />
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <Featured products={data?.featured || []} />
            <Trending products={data?.trending || []} />
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <CategoriesWithProductsSection />
            <NewArrivals products={data?.arrival || []} />
            <div className="max-w-8xl mx-auto">
                <div className="px-4 mb-4">
                    <h2 className="font-display text-xl font-semibold">For You</h2>
                    <p className="text-xs text-muted-foreground">Personalized picks based on your style</p>
                </div>
                <InfiniteFeed />
            </div>
            <ContactSection />
            <NewsletterSection />
        </div>
    );
}
