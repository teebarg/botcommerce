import { getSiteConfig } from "@lib/config";
import { Facebook, Twitter, WhatsApp } from "nui-react-icons";
import Link from "next/link";
import { Instagram } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";
import { Category } from "@/types/models";
import ServerError from "@/components/generic/server-error";
import NewsletterForm from "@/components/store/newsletter";

const about = [
    {
        label: "Our Story",
        to: "/our-story",
    },
    {
        label: "Latest News",
        to: "/latest-news",
    },
    {
        label: "Support",
        to: "/support",
    },
    {
        label: "Career Opportunities",
        to: "/career-opportunities",
    },
];

const legal = [
    {
        label: "Claim",
        to: "/claim",
    },
    {
        label: "Privacy",
        to: "/privacy",
    },
    {
        label: "Terms",
        to: "/terms",
    },
    {
        label: "User Agreement",
        to: "/user-agreement",
    },
];

export default async function Footer() {
    const siteConfig = await getSiteConfig();
    const collectionResponse = await api.collection.all({ limit: 6 });

    if (!collectionResponse.data) {
        return <ServerError />;
    }
    const { collections } = collectionResponse.data;
    const catRes = await api.category.all({ limit: 100 });
    const { categories: cat } = catRes.data ?? {};
    const categories = cat?.filter((cat: Category) => !cat.parent_id).slice(0, 6);

    return (
        <footer className="flex w-full flex-col pb-20 md:pb-12 bg-content1">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-8 sm:pt-24 lg:px-8 md:pt-32">
                <div className="hidden md:grid md:grid-cols-3 md:gap-8">
                    <div className="space-y-4 md:pr-8">
                        <div className="flex items-center justify-start">
                            <span className="text-3xl font-semibold">{siteConfig?.name}</span>
                        </div>
                        <p className="text-sm text-default-500">
                            {`We are a dedicated online store offering a wide range of high-quality and fun products for kids. Our mission is to bring
                            joy and happiness to every child's life.`}
                        </p>
                        <div className="flex space-x-6">
                            <Link aria-label="Twitter" href={siteConfig?.links?.facebook}>
                                <Facebook className="text-default-500" size={34} />
                            </Link>
                            <Link aria-label="Twitter" href={siteConfig?.links?.instagram}>
                                <Instagram className="text-default-500" size={34} />
                            </Link>
                            <Link aria-label="Twitter" href={siteConfig?.links?.tiktok}>
                                <WhatsApp className="text-default-500" size={30} />
                            </Link>
                            <Link aria-label="Twitter" href={siteConfig?.links?.x}>
                                <Twitter className="text-default-500" size={34} />
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 col-span-2 mt-8 md:mt-0">
                        {collections?.length > 0 && (
                            <div className="hidden md:block">
                                <div>
                                    <h3 className="text-base font-semibold text-default-500">Collections</h3>
                                    <ul className="mt-2 space-y-1">
                                        {collections?.slice(0, 6).map((c: any, index: number) => (
                                            <li key={index}>
                                                <LocalizedClientLink
                                                    className="text-sm hover:opacity-80 transition-opacity text-default-500"
                                                    href={`/collections/${c.slug}`}
                                                >
                                                    {c.name}
                                                </LocalizedClientLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {categories && categories?.length > 0 && (
                            <div className="hidden md:block">
                                <h3 className="text-base font-semibold text-default-500">Categories</h3>
                                <ul className="mt-2 space-y-2" data-testid="footer-categories">
                                    {categories?.map((c: Category, index: number) => {
                                        return (
                                            <li key={index}>
                                                <LocalizedClientLink
                                                    className="text-sm hover:opacity-80 transition-opacity text-default-500"
                                                    data-testid="category-link"
                                                    href={`/collections?cat_ids=${c.slug}`}
                                                >
                                                    {c.name}
                                                </LocalizedClientLink>
                                                {c.subcategories && c.subcategories?.length > 0 && (
                                                    <ul className="ml-4 space-y-1">
                                                        {c.subcategories?.map((child: Category) => (
                                                            <li key={child.id}>
                                                                <LocalizedClientLink
                                                                    className="text-sm hover:opacity-80 transition-opacity text-default-500"
                                                                    data-testid="category-link"
                                                                    href={`/collections?cat_ids=${child.slug}`}
                                                                >
                                                                    {child.name}
                                                                </LocalizedClientLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        <div>
                            <h3 className="text-base font-semibold text-default-500">About Us</h3>
                            <ul className="mt-2 space-y-2">
                                {about.map((item, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink className="text-sm hover:opacity-80 transition-opacity text-default-500" href={item.to}>
                                            {item.label}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-default-500">Legal</h3>
                            <ul className="mt-2 space-y-2">
                                {legal.map((item, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink className="text-sm hover:opacity-80 transition-opacity text-default-500" href={item.to}>
                                            {item.label}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="my-2 md:my-10 bg-default-100/20 py-4 md:flex md:items-center md:justify-between md:gap-2">
                    <div>
                        <h3 className="text-base font-semibold text-default-500">Subscribe to our newsletter</h3>
                        <p className="mt-2 text-sm text-default-500">
                            Receive weekly updates with the newest insights, trends, and tools, straight to your email.
                        </p>
                    </div>
                    <NewsletterForm />
                </div>
                <div className="flex flex-wrap justify-between gap-2 md:pt-8">
                    <p className="text-sm text-default-500">
                        &copy; {new Date().getFullYear()} {siteConfig?.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
