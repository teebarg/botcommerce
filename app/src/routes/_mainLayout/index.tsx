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
import { getIndexProductsFn } from "@/server/product.server";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { LazyInView } from "@/components/LazyInView";
import { categoriesQuery } from "@/hooks/useCategories";

const indexProductQuery = () =>
    queryOptions({
        queryKey: ["products", "collections"],
        queryFn: () => getIndexProductsFn(),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 2,
    });

export const Route = createFileRoute("/_mainLayout/")({
    component: Home,
    loader: async ({ context: { queryClient } }) => {
        queryClient.prefetchQuery(categoriesQuery());
        queryClient.prefetchQuery(indexProductQuery());
        const image = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
        return {
            heroImage: image,
        };
    },
});

function Home() {
    const { heroImage } = Route.useLoaderData();
    const { data, isPending } = useQuery(indexProductQuery());

    return (
        <div className="animate-in fade-in-50 duration-300">
            <SaleBanner />
            <CategoriesSection />
            <NewArrivals products={data?.arrival || []} isLoading={isPending} />
            <HeroSection image={heroImage} />
            <Trending products={data?.trending || []} isLoading={isPending} />
            <PromotionalBanner
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
                href="/collections"
            />
            <SizesGrid />
            <Featured products={data?.featured || []} isLoading={isPending} />
            <PromotionalBanner
                subtitle="Get free deliveries on order above ₦50,000."
                title="Big Sale on Top Brands!"
            />
            <LazyInView
                fallback={
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    </div>
                }
            >
                <CategoriesWithProductsSection /> 
            </LazyInView>
            <div className="max-w-sxl mx-auto px-2">
                <div className="px-4 mb-4">
                    <h2 className="font-display text-xl font-semibold">For You</h2>
                    <p className="text-xs text-muted-foreground">Personalized picks based on your style</p>
                </div>
                <LazyInView
                    fallback={
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                        </div>
                    }
                >
                    <InfiniteFeed />
                </LazyInView>
            </div>
            <ContactSection />
            <NewsletterSection />
        </div>
    );
}
