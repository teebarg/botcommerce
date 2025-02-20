import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Category, Collection, Product, SearchParams, WishlistItem } from "types/global";
import React from "react";
import { Commerce, Deal, LocationIcon, Mail, PhoneCall } from "nui-react-icons";
import { openingHours, siteConfig } from "@lib/config";
import { imgSrc } from "@lib/util/util";
import { getCategories, getCustomer, getWishlist, productSearch } from "@lib/data";
import Image from "next/image";

import { BtnLink } from "@/components/ui/btnLink";
import PromotionalBanner from "@/components/promotion";
import LocalizedClientLink from "@/components/ui/link";

const BannerCarousel = dynamic(() => import("@components/carousel"));
const ContactForm = dynamic(() => import("@modules/store/components/contact-form"));
const ProductCard = dynamic(() => import("@/components/product/product-card"), { loading: () => <p>Loading...</p> });

export const metadata: Metadata = {
    title: `Children clothings | ${siteConfig.name}`,
    description: siteConfig.description,
};

async function getLandingProducts(collection: string, limit: number = 4): Promise<any[]> {
    const queryParams: SearchParams = {
        query: "",
        limit,
        page: 1,
        collections: collection,
    };

    const { products } = await productSearch(queryParams);

    return products;
}

export default async function Home() {
    const [trending, latest, featured, { categories }, customer] = await Promise.all([
        getLandingProducts("trending"),
        getLandingProducts("latest"),
        getLandingProducts("featured", 6),
        getCategories(),
        getCustomer(),
    ]);

    let wishlist: WishlistItem[] = [];

    if (customer) {
        const { wishlists } = (await getWishlist()) || {};

        wishlist = wishlists;
    }

    return (
        <React.Fragment>
            <div>
                <div className="bg-content1">
                    <div className="max-w-8xl mx-auto relative hidden md:grid grid-cols-5 gap-4 rounded-xl py-6">
                        <div className="hidden md:block">
                            <span className="text-lg font-semibold block bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">Categories</span>
                            <ul className="bg-primary/10">
                                {categories?.map((item: Category, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink
                                            className="font-medium border border-primary/20 p-3 block hover:bg-primary/20"
                                            href={`/collections?cat_ids=${item.slug}`}
                                        >
                                            {item.name}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                            <LocalizedClientLink className="px-4 pt-4 block hover:text-primary underline underline-offset-4" href="/collections">
                                All Products
                            </LocalizedClientLink>
                        </div>
                        <div className="col-span-3">
                            <BannerCarousel />
                        </div>
                        <div className="w-full hidden md:flex flex-col">
                            <div className="bg-warning/15 p-4 rounded-lg hidden md:block space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-50 ring-1 ring-warning p-2">
                                        <PhoneCall className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Call to Order</p>
                                        <p className="text-xs font-medium">{siteConfig.contactPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-50 ring-1 ring-warning p-2">
                                        <Commerce className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-semibold">Sell on {siteConfig.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-50 ring-1 ring-warning p-2">
                                        <Deal className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-semibold">Best Deals</p>
                                </div>
                            </div>
                            <div className="py-20 text-center block md:hidden">
                                <span className="text-secondary text-4xl font-bold block">{siteConfig.name}!</span>
                                <span className="text-secondary text-xl block mt-2">Luxury online shopping.</span>
                            </div>
                            <div className="block md:hidden mt-0 md:mt-5">search component</div>
                            <div className="flex items-center bg-secondary text-secondary-foreground p-4 rounded-lg mt-8 md:mt-4 flex-1">
                                <div>
                                    <span className="block">Prime Store</span>
                                    <span className="block text-2xl mt-2 font-bold">Looking Originals?</span>
                                    <span className="block my-2">Explore the latest premium quality branded products.</span>
                                    <BtnLink color="secondary" href="/collections">
                                        Visit Shop!
                                    </BtnLink>
                                </div>
                            </div>
                            <div className="bg-warning/15 p-4 rounded-lg mt-8 md:mt-4 text-default-900/80">
                                <span className="font-semibold text-lg">Need Help?</span>
                                <span className="block">
                                    Visit{" "}
                                    <LocalizedClientLink className="font-semibold hover:text-default-900" href="/support">
                                        Support Center
                                    </LocalizedClientLink>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Hero Section */}
                    <div
                        className="relative h-[50vh] md:hidden bg-cover"
                        style={{
                            backgroundImage: `url("https://bzjitsvxyblegrvtzvef.supabase.co/storage/v1/object/public/banners/tbo-banner-2.avif")`,
                        }}
                    >
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 bg-gradient-to-b from-transparent via-transparent to-secondary/90">
                            <div className="flex overflow-x-auto gap-3 py-2 w-full no-scrollbar">
                                {categories?.map((category: Collection, index: number) => (
                                    <BtnLink
                                        key={index}
                                        className="flex-none h-24 min-w-24 rounded-full text-lg"
                                        color="secondary"
                                        href={`/collections?cat_ids=${category.slug}`}
                                    >
                                        {category.name}
                                    </BtnLink>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative py-2">
                    <PromotionalBanner
                        btnClass="text-purple-600"
                        outerClass="from-purple-500 via-pink-500 to-orange-400 mx-2 md:mx-auto max-w-8xl"
                        subtitle="Get up to 50% OFF on select products."
                        title="Big Sale on Top Brands!"
                    />
                </div>
                <div className="bg-content1">
                    <div className="max-w-8xl mx-auto relative py-2 md:py-8 px-4 md:px-0 min-h-96 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                {featured?.map((product: Product, index: number) => (
                                    <ProductCard key={index} product={product} showWishlist={Boolean(customer)} wishlist={wishlist} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="from-purple-500 via-pink-500 to-orange-400 mx-2 md:mx-auto max-w-8xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
                <div className="bg-content1">
                    <div className="max-w-8xl mx-auto relative py-8 px-4 md:px-0">
                        <p className="text-lg text-primary mb-2 font-semibold">Trending</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                            {trending?.map((product: Product, index: number) => (
                                <ProductCard key={index} product={product} showWishlist={Boolean(customer)} wishlist={wishlist} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <PromotionalBanner
                        btnClass="text-purple-600"
                        outerClass="rom-purple-500 to-pink-500 md:mx-auto max-w-8xl"
                        subtitle="Get up to 50% OFF on select products."
                        title="Big Sale on Top Brands!"
                    />
                </div>
                <div className="bg-content1 py-12">
                    <div className="max-w-8xl mx-auto px-4">
                        <p className="text-primary font-semibold">New Arrivals</p>
                        <p className="text-2xl font-semibold">Find the best thrifts for your kids</p>
                        <p className="text-default-500">
                            {`We provide a curated selection of children's thrifts, ensuring top quality at unbeatable prices. Discover a variety of
                            items including clothes, shoes, and accessories for your little ones.`}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6">
                            {latest?.map((product: Product, index: number) => (
                                <ProductCard key={index} product={product} showWishlist={Boolean(customer)} wishlist={wishlist} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-fixed bg-center" style={{ backgroundImage: `url(${imgSrc("banners%2Fhero-contact.jpg")})` }}>
                    <div className="flex items-center h-full">
                        <div className="max-w-5xl mx-auto sm:flex gap-8 py-16 sm:px-2">
                            <div className="sm:w-1/2 sm:pr-10 backdrop-blur-sm bg-black/50 text-gray-100 p-4 sm:p-8 rounded-lg">
                                <p className="text-lg font-medium text-danger">GET IN TOUCH</p>
                                <p className="text-xl font-semibold">Reach out to us for more information</p>
                                <p className="font-medium">
                                    For inquiries or to place an order, contact us today. We are here to assist you with any questions you may have
                                    about our products and services.
                                </p>
                                <ContactForm />
                            </div>
                            <div className="sm:w-1/2 backdrop-blur-sm bg-black/50 px-4 py-12 sm:p-8 rounded-lg text-gray-100 mt-6 sm:mt-0">
                                <div>
                                    <p className="font-semibold text-xl">Our Contacts</p>
                                    <div className="flex gap-2">
                                        <Mail />
                                        <p>{siteConfig.contactEmail}</p>
                                    </div>
                                    <p className="font-semibold mt-6 text-xl">Location</p>
                                    <div className="flex gap-2">
                                        <LocationIcon className="fill-current" />
                                        <p className="underline">Lagos, LA NG</p>
                                    </div>
                                    <p className="font-semibold mt-6 text-xl">Opening Hours</p>
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
                </div>
                <div className="bg-white/90">
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
