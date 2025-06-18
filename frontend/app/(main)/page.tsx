import { Metadata } from "next";
import React from "react";
import { Location, Mail } from "nui-react-icons";
import { getSiteConfig, openingHours } from "@lib/config";
import Image from "next/image";

import PromotionalBanner from "@/components/promotion";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";
import { api as baseApi } from "@/apis/base";
import { WishItem } from "@/schemas";
import { auth } from "@/actions/auth";
import ProductCard from "@/components/store/products/product-card";
import ContactForm from "@/components/store/contact-form";
import CategoriesSection from "@/components/store/landing/category-section";
import { ProductSearch } from "@/schemas/product";
import CarouselSection from "@/components/store/carousel";

export const metadata: Metadata = {
    title: "Home",
    description: "Welcome to our store",
};

export default async function Home() {
    const user = await auth();
    const siteConfig = await getSiteConfig();
    const { data } = await baseApi.get<{ trending: ProductSearch[]; latest: ProductSearch[]; featured: ProductSearch[] }>(
        "/product/landing-products",
        { next: { tags: ["featured"] }, cache: "default" }
    );

    let wishlist: WishItem[] = [];

    if (user) {
        const { data } = await api.user.wishlist();

        wishlist = data?.wishlists || [];
    }

    return (
        <div className="pb-16">
            <CarouselSection />

            <CategoriesSection />

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            <div className="max-w-8xl mx-auto relative px-1 md:px-0 min-h-96 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative hidden md:block rounded-lg overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full p-5 mt-5 text-center z-10">
                        <span className="text-primary text-3xl font-semibold">{siteConfig.name}</span>
                        <span className="text-primary text-lg block mt-4 mb-4">Explore the exclusive beauty and cosmetics collection.</span>
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
                        {data?.featured?.map((product: ProductSearch, index: number) => (
                            <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} />
                        ))}
                    </div>
                </div>
            </div>

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            <div>
                <div className="max-w-8xl mx-auto relative px-1 md:px-0">
                    <p className="text-lg text-primary mb-2 font-semibold">Trending</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                        {data?.trending?.map((product: ProductSearch, index: number) => (
                            <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} />
                        ))}
                    </div>
                </div>
            </div>

            <PromotionalBanner
                btnClass="text-purple-600"
                outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                subtitle="Get up to 50% OFF on select products."
                title="Big Sale on Top Brands!"
            />

            <div>
                <div className="max-w-8xl mx-auto px-1 md:px-0">
                    <p className="text-primary font-semibold">New Arrivals</p>
                    <p className="text-2xl font-semibold">Find the best thrifts for your kids</p>
                    <p className="text-default-500">
                        {`We provide a curated selection of children's thrifts, ensuring top quality at unbeatable prices. Discover a variety of
                            items including clothes, shoes, and accessories for your little ones.`}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6">
                        {data?.latest?.map((product: ProductSearch, index: number) => (
                            <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto sm:flex gap-8 py-4 sm:px-2 rounded-lg shadow-xl bg-content1">
                <div className="sm:w-1/2 sm:pr-10 p-4 sm:p-8">
                    <p className="text-xl font-medium text-default-900">Reach out to us for more information</p>
                    <p className="font-medium text-default-500 text-sm">
                        For inquiries or to place an order, contact us today. We are here to assist you with any questions you may have about our
                        products and services.
                    </p>
                    <ContactForm />
                </div>
                <div className="sm:w-1/2 px-4 py-12 sm:p-8 mt-6 sm:mt-0">
                    <div>
                        <p className="font-semibold text-md text-default-500">Our Contacts</p>
                        <div className="flex gap-2 text-default-800">
                            <Mail />
                            <p>{siteConfig.contactEmail}</p>
                        </div>
                        <p className="font-semibold mt-6 text-md text-default-500">Location</p>
                        <div className="flex gap-2 text-default-800">
                            <Location className="fill-current" />
                            <p className="underline">Lagos, LA NG</p>
                        </div>
                        <p className="font-semibold mt-6 text-md text-default-500">Opening Hours</p>
                        <div>
                            {openingHours?.map((hour, index) => (
                                <div key={index} className="grid grid-cols-3">
                                    <p>{hour.day}</p>
                                    <p className="col-span-2">{hour.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6">
                <p className="text-lg font-semibold text-default-800 mb-2 ml-2 sm:ml-0">OUR LOCATION</p>
                <iframe
                    allowFullScreen={true}
                    height="500"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.7044697975375!2d3.3243740696178534!3d6.66947613161211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b96bc12c94145%3A0xce8a5a69dcdc4350!2s8%20Agbado%20Oke%20Aro%20Road%2C%20Ifako-Ijaiye%2C%20Lagos%20101232%2C%20Lagos!5e0!3m2!1sen!2sng!4v1718193637813!5m2!1sen!2sng"
                    style={{ border: 0, width: "100%", borderRadius: "2%" }}
                    title="map"
                />
            </div>
        </div>
    );
}
