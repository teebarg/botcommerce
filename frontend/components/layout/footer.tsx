"use client";

import { Facebook, Twitter, WhatsApp } from "nui-react-icons";
import Link from "next/link";
import { Instagram } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import { Category } from "@/schemas/product";
import { useStore } from "@/app/store/use-store";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCollections } from "@/lib/hooks/useCollection";
import { Separator } from "@/components/ui/separator";

const company = [
    {
        label: "About",
        to: "/about",
    },
    {
        label: "Careers",
        to: "/careers",
    },
    {
        label: "Privacy",
        to: "/privacy",
    },
    {
        label: "Terms",
        to: "/terms",
    },
];

const support = [
    {
        label: "Help Center",
        to: "/help-center",
    },
    {
        label: "Contact Us",
        to: "/contact-us",
    },
    {
        label: "Returns",
        to: "/returns",
    },
    {
        label: "Shipping",
        to: "/shipping",
    },
];

export default function Footer() {
    const { shopSettings } = useStore();

    const { data: collections } = useCollections();

    const { data: cat } = useCategories();
    const categories = cat?.filter((cat: Category) => !cat.parent_id).slice(0, 6);

    return (
        <footer className="flex w-full flex-col pb-20 md:pb-12 bg-content1 border-t border-divider">
            <div className="hidden md:block mx-auto max-w-7xl px-6 pb-8 pt-8 sm:pt-24 lg:px-8 md:pt-32">
                <div className="hidden md:grid md:grid-cols-3 md:gap-8">
                    <div className="md:pr-8">
                        <div className="flex items-center justify-start">
                            <span className="text-3xl font-semibold text-primary">{shopSettings?.shop_name}</span>
                        </div>
                        <p className="text-sm text-default-600">
                            {`We are a dedicated online store offering a wide range of high-quality and fun products for kids. Our mission is to bring
                            joy and happiness to every child's life.`}
                        </p>
                        <div className="flex space-x-6 mt-4">
                            <Link aria-label="Twitter" href={shopSettings?.facebook || "#"}>
                                <Facebook className="text-default-500 hover:text-primary transition-colors" size={34} />
                            </Link>
                            <Link aria-label="Twitter" href={shopSettings?.instagram || "#"}>
                                <Instagram className="text-default-500 hover:text-primary transition-colors" size={34} />
                            </Link>
                            <Link aria-label="Twitter" href={shopSettings?.tiktok || "#"}>
                                <WhatsApp className="text-default-500 hover:text-primary transition-colors" size={30} />
                            </Link>
                            <Link aria-label="Twitter" href={shopSettings?.x || "#"}>
                                <Twitter className="text-default-500 hover:text-primary transition-colors" size={34} />
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 col-span-2 mt-8 md:mt-0">
                        {collections && collections?.length > 0 && (
                            <div className="hidden md:block">
                                <div>
                                    <h3 className="text-base font-semibold text-default-foreground">Collections</h3>
                                    <ul className="mt-2 space-y-2 text-default-600">
                                        {collections?.slice(0, 6).map((c: any, index: number) => (
                                            <li key={index}>
                                                <LocalizedClientLink
                                                    className="text-sm hover:text-primary transition-colors"
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
                                <h3 className="text-base font-semibold text-default-foreground">Categories</h3>
                                <ul className="mt-2 space-y-2 text-default-600" data-testid="footer-categories">
                                    {categories?.map((c: Category, index: number) => {
                                        return (
                                            <li key={index}>
                                                <LocalizedClientLink
                                                    className="text-sm hover:text-primary transition-colors"
                                                    data-testid="category-link"
                                                    href={`/collections?cat_ids=${c.slug}`}
                                                >
                                                    {c.name}
                                                </LocalizedClientLink>
                                                {c.subcategories && c.subcategories?.length > 0 && (
                                                    <ul className="ml-4 space-y-2">
                                                        {c.subcategories?.map((child: Category) => (
                                                            <li key={child.id}>
                                                                <LocalizedClientLink
                                                                    className="text-sm hover:text-primary transition-colors"
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
                            <h3 className="text-base font-semibold text-default-foreground">Support</h3>
                            <ul className="mt-2 space-y-2 text-default-600">
                                {support.map((item, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink className="text-sm hover:text-primary transition-colors" href={item.to}>
                                            {item.label}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-default-foreground">Company</h3>
                            <ul className="mt-2 space-y-2 text-default-600">
                                {company.map((item, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink className="text-sm hover:text-primary transition-colors" href={item.to}>
                                            {item.label}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <Separator className="my-4" />
                <div>
                    <p className="text-sm text-default-500">
                        &copy; {new Date().getFullYear()} {shopSettings?.shop_name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
