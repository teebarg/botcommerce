import { Metadata } from "next";
import React from "react";
import { TrendingUp } from "lucide-react";

import PromotionalBanner from "@/components/promotion";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis/client";
import CategoriesSection from "@/components/store/landing/category-section";
import { ProductSearch } from "@/schemas/product";
import { ContactSection } from "@/components/store/landing/contact-section";
import NewsletterSection from "@/components/store/landing/newsletter-section";
import { tryCatch } from "@/lib/try-catch";
import { LazyFadeIn } from "@/components/LazyFadeIn";
import ProductCard from "@/components/store/products/product-card";
import HeroSection from "@/components/hero-section";

export const metadata: Metadata = {
    title: "Home",
    description: "Welcome to our store",
};

export default async function Home() {
    const { data } = await tryCatch<{ trending: ProductSearch[]; latest: ProductSearch[]; featured: ProductSearch[] }>(
        api.get("/product/landing-products")
    );

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
                <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-content1 dark:to-content2 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center mb-4">
                                <TrendingUp className="text-orange-500 mr-2" size={32} />
                                <h2 className="text-4xl font-bold text-default-900">Featured products</h2>
                            </div>
                            <p className="text-xl text-default-600">Handpicked selections from our premium collection</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {data?.featured?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                        </div>

                        <div className="text-center mt-12">
                            <LocalizedClientLink
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                                href="/collections/trending"
                            >
                                Visit Shop
                            </LocalizedClientLink>
                        </div>
                    </div>
                </section>
            </LazyFadeIn>
            <LazyFadeIn delay={100}>
                <section className="py-16 bg-content2">
                    <div className="max-w-8xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-default-foreground mb-1">Trending Products</h2>
                            <p className="text-default-600">Discover our handpicked selection of premium products</p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {data?.trending?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                        </div>
                    </div>
                </section>
            </LazyFadeIn>
            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />
            <LazyFadeIn delay={100}>
                <section className="bg-content1">
                    <div className="max-w-8xl mx-auto px-4 md:px-0 py-8">
                        <p className="text-3xl font-bold">New Arrivals</p>
                        <p className="text-default-600">Find the best thrifts for your kids</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                            {data?.latest?.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                        </div>
                    </div>
                </section>
            </LazyFadeIn>
            <LazyFadeIn delay={100}>
                <ContactSection />
            </LazyFadeIn>
            <LazyFadeIn delay={100}>
                <NewsletterSection />
            </LazyFadeIn>
        </div>
    );
}
