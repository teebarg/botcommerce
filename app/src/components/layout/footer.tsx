import { Facebook, Twitter, Instagram, MessageSquare } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import type { Category } from "@/schemas/product";
import { useCategories } from "@/hooks/useCategories";
import { useCollections } from "@/hooks/useCollection";
import { Separator } from "@/components/ui/separator";
import { useConfig } from "@/providers/store-provider";

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
    const { config } = useConfig();
    const { data: collections } = useCollections();

    const { data: cat } = useCategories();
    const categories = cat?.filter((cat: Category) => !cat.parent_id).slice(0, 6);

    return (
        <footer className="flex w-full flex-col pb-12 border-t border-border/50">
            <div className="hidden md:block mx-auto max-w-7xl px-6 pb-8 pt-8 sm:pt-24 lg:px-8 md:pt-32">
                <div className="hidden md:grid md:grid-cols-3 md:gap-8">
                    <div className="md:pr-8">
                        <h3 className="text-xl font-semibold">{config?.shop_name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {`We are a dedicated online store offering a wide range of high-quality and fun products for kids. Our mission is to bring
                            joy and happiness to every child's life.`}
                        </p>
                        <div className="flex space-x-6 mt-4">
                            <a
                                aria-label="Twitter"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                href={`https://web.facebook.com/profile.php?id=${config?.facebook}`}
                                target="_blank"
                            >
                                <Facebook className="text-primary" />
                            </a>
                            <a
                                aria-label="Instagram"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                href={`https://www.instagram.com/${config?.instagram}`}
                                target="_blank"
                            >
                                <Instagram className="text-primary" />
                            </a>
                            <a
                                aria-label="Tiktok"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                href={`https://www.tiktok.com/@${config?.tiktok}`}
                                target="_blank"
                            >
                                <MessageSquare className="text-primary" />
                            </a>
                            <a
                                aria-label="X"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                href={`https://x.com/${config?.twitter}`}
                                target="_blank"
                            >
                                <Twitter className="text-primary" />
                            </a>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 col-span-2 mt-8 md:mt-0">
                        {collections && collections?.length > 0 && (
                            <div className="hidden md:block">
                                <div>
                                    <h3 className="text-base font-semibold">Collections</h3>
                                    <ul className="mt-2 space-y-2 text-muted-foreground" data-testid="footer-collections">
                                        {collections?.slice(0, 6).map((c: any, idx: number) => (
                                            <li key={idx}>
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
                                <h3 className="text-base font-semibold">Categories</h3>
                                <ul className="mt-2 space-y-2 text-muted-foreground" data-testid="footer-categories">
                                    {categories?.map((c: Category, idx: number) => {
                                        return (
                                            <li key={idx}>
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
                            <h3 className="text-base font-semibold">Support</h3>
                            <ul className="mt-2 space-y-2 text-muted-foreground">
                                {support.map((item, idx: number) => (
                                    <li key={idx}>
                                        <LocalizedClientLink className="text-sm hover:text-primary transition-colors" href={item.to}>
                                            {item.label}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">Company</h3>
                            <ul className="mt-2 space-y-2 text-muted-foreground">
                                {company.map((item, idx: number) => (
                                    <li key={idx}>
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
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} {config?.shop_name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
