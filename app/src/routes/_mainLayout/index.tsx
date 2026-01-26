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
import NewArrivals from "@/components/store/home/arrival";
import NewsletterSection from "@/components/store/landing/newsletter-section";
import { getCategoriesProductsFn } from "@/server/categories.server";
import CategoriesWithProductsSection from "@/components/store/home/categories-products";

const categoriesProductsQueryOptions = () => ({
    queryKey: ["products", "home"],
    queryFn: () => getCategoriesProductsFn(),
});

export const Route = createFileRoute("/_mainLayout/")({
    component: Home,
    loader: async ({ context: { queryClient } }) => {
        const data = await queryClient.ensureQueryData(categoriesProductsQueryOptions());
        return {
            data,
        };
    },
});

function Home() {
    const loaderData = Route.useLoaderData();
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
            <CategoriesWithProductsSection categoriesWithProducts={loaderData.data} />
            <LazyInView>
                <NewArrivals />
            </LazyInView>
            <ContactSection />
            <NewsletterSection />
        </div>
    );
}
