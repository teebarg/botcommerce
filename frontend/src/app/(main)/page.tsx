import { Metadata } from "next";
import { Product } from "types/global";
import React, { cache } from "react";
import { Image } from "@nextui-org/image";
import { LocationIcon, MailIcon } from "nui-react-icons";
import { openingHours } from "@lib/config";
import { buildUrl, imgSrc } from "@lib/util/util";
import ContactForm from "@modules/store/components/contact-form";
import Button from "@modules/common/components/button";
import { ProductCard } from "@modules/products/components/product-card";

export const metadata: Metadata = {
    title: "Children clothing | TBO Store",
    description: "A performant frontend ecommerce starter template with Next.js.",
};

const getCollectionsWithProducts = cache(async (collection: string): Promise<{ products: Product[] } | null> => {
    const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { collections: collection, per_page: 4 });
    const res = await fetch(url, {
        next: {
            tags: ["campaigns"],
        },
        headers: {
            "Content-Type": "application/json",
        },
    }).catch((error) => {
        console.error("Error fetching collections:", error);
        return null;
    });

    if (!res) {
        console.error("Failed to fetch collections");
        return null;
    }
    return res.json();
});

export default async function Home() {
    const trending = await getCollectionsWithProducts("trending");
    const latest = await getCollectionsWithProducts("latest");

    if (!trending && !latest) {
        return null;
    }

    return (
        <React.Fragment>
            <div>
                <div>
                    <div className="max-w-7xl mx-auto relative sm:flex sm:flex-row-reverse bg-[#fee3f1] rounded-xl my-4 sm:my-8 min-h-72">
                        <div className="sm:w-1/2">
                            <Image alt="banner" className="w-full" radius="none" src={imgSrc(`banners%2Fhero4.webp`)} />
                        </div>
                        <div className="sm:w-1/2 sm:flex flex-col items-center justify-center text-gray-600 py-8 sm:py-0 px-2 sm:px-0">
                            <h1 className="text-4xl font-semibold">Explore thrifts for kids</h1>
                            <p>We are obsessed with colourful drip</p>
                            <p className="text-2xl font-medium mt-1">{`Discover affordable children's thrifts in Lagos`}</p>
                            <div className="gap-4 mt-6">
                                <Button className="px-4 py-2 min-w-36 bg-slate-50 text-inherit" size="lg">
                                    Shop Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-default-100">
                    <div className="max-w-7xl mx-auto relative py-8 min-h-48">
                        <Image alt="banner" className="h-auto w-full" src={imgSrc(`banners%2Fbanner1.avif`)} />
                        <div className="grid grid-cols-2 md:flex flex-wrap mt-4 sm:mt-0 mx-auto sm:absolute bottom-16 right-4 gap-2 ml-auto z-10 px-4 md:px-0">
                            {["Boy", "Girl", "Toddler Boy", "Toddler Boy"].map((item: string, index: number) => (
                                <Button key={index} className="min-w-36" size="lg" variant="flat">
                                    {item}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-default-50">
                    <div className="max-w-6xl mx-auto relative py-8 px-4 md:px-0">
                        <p className="text-lg uppercase text-primary mb-2 font-semibold">Collections</p>
                        <div className="md:grid grid-cols-2 gap-4">
                            <div className="md:grid grid-cols-2 gap-4">
                                <Image alt="cat1" src={imgSrc(`banners%2Fcat1.jpeg`)} />
                                <Image alt="cat2" src={imgSrc(`banners%2Fcat2.jpeg`)} />
                                <Image alt="cat4" src={imgSrc(`banners%2Fcat4.jpeg`)} />
                                <Image alt="cat3" src={imgSrc(`banners%2Fcat3.jpeg`)} />
                            </div>
                            <div>
                                <Image alt="cat5" className="h-[inherit]" src={imgSrc(`banners%2Fcat5.avif`)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-default-50">
                    <div className="max-w-7xl mx-auto relative py-8 px-4 md:px-0">
                        <p className="text-lg uppercase text-primary mb-2 font-semibold">Trending</p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            {trending?.products?.map((product: Product, index: number) => (
                                <ProductCard key={index} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-default-100">
                    <div className="max-w-7xl mx-auto relative py-8 min-h-48">
                        <Image alt="banner" className="h-auto w-full" src={imgSrc(`banners%2Fbanner2.avif`)} />
                        <div className="grid grid-cols-2 md:flex flex-wrap sm:absolute bottom-16 left-4 gap-2 ml-auto z-10 mt-4 sm:mt-0 px-4 md:px-0">
                            {["Shorts", "Tops", "Shoes", "Gowns"].map((item: string, index: number) => (
                                <Button key={index} className="min-w-36" size="lg" variant="flat">
                                    {item}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-default-100 py-16">
                    <div className="max-w-7xl mx-auto px-4">
                        <p className="text-primary font-medium">New Arrivals</p>
                        <p className="text-2xl font-semibold">Find the best thrifts for your kids</p>
                        <p className="text-default-700">
                            {`We provide a curated selection of children's thrifts, ensuring top quality at unbeatable prices. Discover a variety of
                            items including clothes, shoes, and accessories for your little ones.`}
                        </p>
                        <div className="grid sm:grid-cols-4 gap-8 mt-6">
                            {latest?.products?.map((product: Product, index: number) => (
                                <ProductCard key={index} product={product} />
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
                                <p className="text-gray-700">
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
                                        <MailIcon />
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
