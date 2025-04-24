import { Metadata } from "next";
import React from "react";
import { Location, Mail } from "nui-react-icons";
import { getSiteConfig, openingHours } from "@lib/config";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import PromotionalBanner from "@/components/promotion";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";
import { api as baseApi } from "@/apis/base";
import { Category, ProductSearch, WishItem } from "@/types/models";
import { auth } from "@/actions/auth";
import ProductCard from "@/components/store/products/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ContactForm from "@/components/store/contact-form";

// Mock banners
const banners = [
    {
        id: 1,
        title: "Summer Sale",
        subtitle: "Up to 50% off",
        description: "On selected electronics and accessories",
        buttonText: "Shop Now",
        image: "https://firebasestorage.googleapis.com/v0/b/shopit-ebc60.appspot.com/o/banners%2Fbanner2.jpg?alt=media",
        link: "/collections",
    },
    {
        id: 2,
        title: "New Arrivals",
        subtitle: "The Latest Tech",
        description: "Discover the newest gadgets and innovations",
        buttonText: "Explore",
        image: "https://bzjitsvxyblegrvtzvef.supabase.co/storage/v1/object/public/banners/tbo-banner-2.avif",
        link: "/collections/featured",
    },
    {
        id: 3,
        title: "Home Essentials",
        subtitle: "Create Your Space",
        description: "Everything you need for a comfortable home",
        buttonText: "View Collection",
        image: "https://firebasestorage.googleapis.com/v0/b/shopit-ebc60.appspot.com/o/banners%2Fbanner1.jpg?alt=media",
        link: "/collections/latest",
    },
];

export const metadata: Metadata = {
    title: "Children clothings",
};

export default async function Home() {
    const user = await auth();
    const siteConfig = await getSiteConfig();
    const { data } = await baseApi.get<{ trending: ProductSearch[]; latest: ProductSearch[]; featured: ProductSearch[] }>(
        "/product/landing-products",
        { next: { tags: ["featured"] } }
    );
    const [catRes] = await Promise.all([api.category.all({ limit: 4 })]);

    const { categories } = catRes.data ?? {};

    let wishlist: WishItem[] = [];

    if (user) {
        const { data } = await api.user.wishlist();

        wishlist = data?.wishlists || [];
    }

    return (
        <React.Fragment>
            <div className="pb-16">
                {/* Hero Banner Carousel */}
                <section className="relative">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {banners.map((banner, idx: number) => (
                                <CarouselItem key={idx}>
                                    <div className="relative h-[60vh] w-full overflow-hidden">
                                        <img alt={banner.title} className="object-cover w-full h-full" src={banner.image} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                                            <div className="container mx-auto px-4 md:px-8 lg:px-12">
                                                <div className="max-w-xl text-white">
                                                    <h2 className="text-xl md:text-2xl font-medium mb-2">{banner.subtitle}</h2>
                                                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{banner.title}</h1>
                                                    <p className="text-lg mb-6 text-white/80">{banner.description}</p>
                                                    {/* <Button asChild className="bg-commerce-secondary hover:bg-commerce-secondary/90">
                                                        <Link href={banner.link}>{banner.buttonText}</Link>
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                </section>

                {/* Category Sections */}
                <section className="pt-6 md:pt-10">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-commerce-primary mb-4 text-center">Shop by Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories?.map((category: Category, idx: number) => (
                                <Link key={idx} className="group" href={`collections?cat_ids=${category.slug}`}>
                                    <div className="relative h-48 rounded-lg overflow-hidden">
                                        <img
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                            src={category.image}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                            <div className="w-full flex items-center justify-between">
                                                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                                                <ChevronRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="from-purple-500 via-pink-500 to-orange-400 my-4 mx-2 md:mx-auto max-w-8xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
                <div>
                    <div className="max-w-8xl mx-auto relative px-1 md:px-0 min-h-96 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative hidden md:block rounded-lg overflow-hidden h-fit">
                            <div className="absolute top-0 left-0 w-full p-5 mt-5 text-center z-10">
                                <span className="text-secondary text-3xl font-semibold">{siteConfig.name}</span>
                                <span className="text-secondary text-lg block mt-4 mb-4">Explore the exclusive beauty and cosmetics collection.</span>
                                <LocalizedClientLink
                                    className="bg-transparent text-secondary border-2 border-secondary rounded-full px-8 py-2 hover:bg-secondary/10"
                                    href="/collections"
                                >
                                    Visit Shop
                                </LocalizedClientLink>
                            </div>
                            <Image alt="banner" className="h-auto w-full" height={0} sizes="100vw" src={"/side-banner.webp"} width={0} />
                        </div>
                        <div className="col-span-3">
                            <h2 className="text-lg text-primary mb-2 font-semibold">Featured products</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                {data?.featured?.map((product: ProductSearch, index: number) => (
                                    <ProductCard key={index} product={product} showWishlist={Boolean(user)} wishlist={wishlist} />
                                ))}
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
                    outerClass="rom-purple-500 to-pink-500 md:mx-auto max-w-8xl my-4"
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
                <div className="">
                    <div className="max-w-5xl mx-auto sm:flex gap-8 py-16 sm:px-2">
                        <div className="sm:w-1/2 sm:pr-10 p-4 sm:p-8 rounded-lg">
                            <p className="text-lg font-medium text-danger">GET IN TOUCH</p>
                            <p className="text-xl font-medium text-default-800">Reach out to us for more information</p>
                            <p className="font-semibold text-default-600">
                                For inquiries or to place an order, contact us today. We are here to assist you with any questions you may have about
                                our products and services.
                            </p>
                            <ContactForm />
                        </div>
                        <div className="sm:w-1/2 px-4 py-12 sm:p-8 rounded-lg mt-6 sm:mt-0">
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
                </div>
                <div>
                    <div className="max-w-7xl mx-auto py-6">
                        <p className="text-lg font-semibold text-gray-800 mb-2 ml-2 sm:ml-0">OUR LOCATION</p>
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
            </div>
        </React.Fragment>
    );
}
