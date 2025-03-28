import React from "react";
import { Commerce, Deal, PhoneCall } from "nui-react-icons";
import { siteConfig } from "@lib/config";

import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import { Category } from "@/types/models";
import BannerCarousel from "@/components/carousel";

interface Props {
    categories: Category[];
}

const StoreHero: React.FC<Props> = ({ categories }) => {
    return (
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
                        {categories?.map((category: Category, index: number) => (
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
    );
};

export default StoreHero;
