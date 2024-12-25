import { Metadata } from "next";
import { Customer, Product, SearchParams, WishlistItem } from "types/global";
import React from "react";
import { LocationIcon, Mail } from "nui-react-icons";
import { openingHours } from "@lib/config";
import { imgSrc } from "@lib/util/util";
import ContactForm from "@modules/store/components/contact-form";
import { getCustomer, getWishlist, search } from "@lib/data";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import FlashBanner from "@components/flash";
import BannerCarousel from "@components/carousel";
import { ProductCard } from "@/modules/products/components/product-card";

export const metadata: Metadata = {
    title: "Children clothing | Botcommerce Store",
    description: "A performant frontend ecommerce starter template with Next.js.",
};

const cats = ["Electronics", "Health & Beauty", "Men's Fashion", "Women's Fashion", "Sports & Hobby", "Tools", "Kids"];

export const revalidate = 1;

async function getLandingProducts(collection: string, limit: number = 4): Promise<any[]> {
    const queryParams: SearchParams = {
        query: "",
        limit,
        page: 1,
        sort: "created_at:desc",
        collections: collection,
    };

    const { products } = await search(queryParams);

    return products;
}

export default async function Home() {
    const [trending, latest, featured] = await Promise.all([
        getLandingProducts("trending"),
        getLandingProducts("latest"),
        getLandingProducts("featured", 8),
    ]);

    const customer: Customer = await getCustomer().catch(() => null);
    let wishlist: WishlistItem[] = [];

    if (customer) {
        wishlist = await getWishlist();
    }

    return (
        <React.Fragment>
            <div>
                <div className="bg-default/10">
                    <div className="max-w-7xl mx-auto relative sm:grid grid-cols-4 gap-4 rounded-xl my-4 sm:my-8">
                        <div className="hidden md:block">
                            <span className="text-lg font-semibold block bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">Categories</span>
                            <ul className="bg-primary/10 text-primary-900">
                                {cats.map((item: any, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink
                                            className="text-md font-medium border border-primary/20 px-3 py-3 block hover:bg-primary/20"
                                            href=""
                                        >
                                            {item}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                            <LocalizedClientLink className="px-4 pt-4 block hover:text-primary underline underline-offset-4" href="/collections">
                                All Products
                            </LocalizedClientLink>
                        </div>
                        <div className="col-span-2">
                            <BannerCarousel />
                        </div>
                        <div className="w-full hidden md:block">
                            <div className="bg-warning/15 p-4 rounded-lg hidden md:block">
                                <span className="font-semibold text-lg text-default-900/80">👋 Hello!</span>
                            </div>
                            <div className="py-20 text-center block md:hidden">
                                <span className="text-secondary text-4xl font-bold block">Botcommerce!</span>
                                <span className="text-secondary text-xl block mt-2">Luxury online shopping.</span>
                            </div>
                            <div className="block md:hidden mt-0 md:mt-5">search component</div>
                            <div className="flex bg-secondary text-secondary-foreground p-4 rounded-lg mt-8 md:mt-4">
                                <div>
                                    <span className="block text-xl">Prime Store</span>
                                    <span className="block text-3xl mt-2 font-bold">Looking Originals?</span>
                                    <span className="block mt-2">Explore the latest premium quality branded products.</span>
                                    <LocalizedClientLink
                                        className="inline-block font-semibold bg-transparent rounded-full border-2 border-secondary mt-5 hover:bg-secondary hover:text-white px-4 py-2"
                                        href="/collections"
                                    >
                                        Visit Shop!
                                    </LocalizedClientLink>
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
                </div>
                <div className="relative h-28">
                    <Image fill alt="banner" src={"/frontend.webp"} />
                </div>
                <div className="bg-default-100">
                    <div className="max-w-7xl mx-auto relative py-8 px-4 md:px-0 min-h-96 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative hidden md:block rounded-lg overflow-hidden h-fit">
                            <div className="absolute top-0 left-0 w-full p-5 mt-5 text-center z-10">
                                <span className="text-secondary text-3xl font-semibold">Botcommerce</span>
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
                <FlashBanner />
                <div className="bg-default-100">
                    <div className="max-w-7xl mx-auto relative py-8 px-4 md:px-0">
                        <p className="text-lg text-primary mb-2 font-semibold">Trending</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
                            {trending?.map((product: Product, index: number) => (
                                <ProductCard key={index} product={product} showWishlist={Boolean(customer)} wishlist={wishlist} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="relative h-28">
                    <Image fill alt="banner" src={"/frontend.webp"} />
                </div>
                <div className="bg-default-100 py-16">
                    <div className="max-w-7xl mx-auto px-4">
                        <p className="text-primary font-semibold">New Arrivals</p>
                        <p className="text-2xl font-semibold">Find the best thrifts for your kids</p>
                        <p className="text-default-500">
                            {`We provide a curated selection of children's thrifts, ensuring top quality at unbeatable prices. Discover a variety of
                            items including clothes, shoes, and accessories for your little ones.`}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-8 mt-6">
                            {latest?.map((product: Product, index: number) => (
                                <ProductCard key={index} product={product} showWishlist={Boolean(customer)} wishlist={wishlist} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-fixed bg-center" style={{ backgroundImage: `url(${imgSrc("banners%2Fhero-contact.jpeg")})` }}>
                    <div className="flex items-center h-full backdrop-blur-smp backdrop-saturate-150p bg-white/10p">
                        <div className="max-w-5xl mx-auto sm:flex gap-8 py-16 sm:px-2">
                            <div className="sm:w-1/2 sm:pr-10 backdrop-blur bg-white/60 p-4 sm:p-8 rounded-lg shadow-lg shadow-gray-400">
                                <p className="text-lg font-medium text-primary">GET IN TOUCH</p>
                                <p className="text-2xl font-semibold text-gray-900">Reach out to us for more information</p>
                                <p className="text-gray-500">
                                    For inquiries or to place an order, contact us today. We are here to assist you with any questions you may have
                                    about our products and services.
                                </p>

                                <div>
                                    <ContactForm />
                                </div>
                            </div>
                            <div className="sm:w-1/2 backdrop-blur bg-white/60 p-4 sm:p-8 rounded-lg text-gray-800 mt-6 sm:mt-0">
                                <div>
                                    <p className="font-semibold mt-4 text-xl">Our Contacts</p>
                                    <div className="flex gap-2">
                                        <Mail />
                                        <p>obathrift@gmail.com</p>
                                    </div>
                                    <p className="font-semibold mt-6 text-xl">Location</p>
                                    <div className="flex gap-2">
                                        <LocationIcon />
                                        <p className="underline">Lagos, LA NG</p>
                                    </div>
                                    <p className="font-semibold mt-6 text-xl">Opening Hours</p>
                                    <div>
                                        {openingHours.map((hour, index) => (
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
                <div className="bg-gray-200">
                    <div className="max-w-5xl mx-auto py-8">
                        <p className="text-lg font-semibold text-primary mb-4 ml-2 sm:ml-0">OUR LOCATION</p>
                        <iframe
                            allowFullScreen={true}
                            height="450"
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
