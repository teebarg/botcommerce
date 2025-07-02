import { Metadata } from "next";
import React from "react";
import { getSiteConfig } from "@lib/config";
import Image from "next/image";

import PromotionalBanner from "@/components/promotion";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis/client";
import ProductCard from "@/components/store/products/product-card";
import CategoriesSection from "@/components/store/landing/category-section";
import { ProductSearch } from "@/schemas/product";
import CarouselSection from "@/components/store/carousel";
import { ContactSection } from "@/components/store/landing/contact-section";
import NewsletterSection from "@/components/store/landing/newsletter-section";
import { tryCatch } from "@/lib/try-catch";

export const metadata: Metadata = {
    title: "Home",
    description: "Welcome to our store",
};

export default async function Home() {
    const siteConfig = await getSiteConfig();
    const { data } = await tryCatch<{ trending: ProductSearch[]; latest: ProductSearch[]; featured: ProductSearch[] }>(
        api.get("/product/landing-products")
    );

    return (
        <div>
            <CarouselSection />

            <CategoriesSection />

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            <div className="bg-content1">
                <div className="max-w-8xl mx-auto relative px-1 md:px-0 min-h-96 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative hidden md:block rounded-lg overflow-hidden h-fit">
                        <div className="absolute top-0 left-0 w-full p-5 mt-5 text-center z-10">
                            <span className="text-gray-800 text-3xl font-semibold">{siteConfig.name}</span>
                            <span className="text-gray-600 text-lg block mt-4 mb-4">Explore the exclusive beauty and cosmetics collection.</span>
                            <LocalizedClientLink
                                className="bg-transparent text-primary border-2 border-primary rounded-full px-8 py-2 hover:bg-primary/10"
                                href="/collections"
                            >
                                Visit Shop
                            </LocalizedClientLink>
                        </div>
                        <Image alt="banner" className="h-auto w-full" height={0} sizes="100vw" src={"/side-banner.webp"} width={0} />
                    </div>
                    <div className="col-span-3">
                        <h2 className="text-lg text-default-700 mb-2 font-semibold">Featured products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            {data?.featured?.map((product: ProductSearch, index: number) => <ProductCard key={index} product={product} />)}
                        </div>
                    </div>
                </div>
            </div>

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            <section className="py-16 bg-content2">
                <div className="max-w-8xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-default-foreground mb-2">Trending Products</h2>
                        <p className="text-default-600">Discover our handpicked selection of premium products</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data?.trending?.map((product: ProductSearch, index: number) => <ProductCard key={index} product={product} />)}
                    </div>
                </div>
            </section>

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            <section className="py- bg-content1">
                <div className="max-w-8xl mx-auto px-1 md:px-0">
                    <p className="text-3xl font-bold">New Arrivals</p>
                    <p className="text-default-600">Find the best thrifts for your kids</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6">
                        {data?.latest?.map((product: ProductSearch, index: number) => <ProductCard key={index} product={product} />)}
                    </div>
                </div>
            </section>
            <ContactSection />
            <NewsletterSection />
        </div>
    );
}
