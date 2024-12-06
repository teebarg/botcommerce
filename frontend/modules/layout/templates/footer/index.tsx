import { getCategories, getCollectionsList } from "@lib/data";
import { siteConfig } from "@lib/config";
import { GithubIcon, YoutubeIcon, TwitterIcon, WhatsAppIcon } from "nui-react-icons";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Link from "next/link";
import NewsletterForm from "@modules/store/components/newsletter";
import { Category } from "types/global";

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
    const { collections } = await getCollectionsList(undefined, 1, 6);
    const { categories: cat } = await getCategories("", 1, 100);
    const categories = cat?.filter((cat: Category) => !cat.parent_id).slice(0, 6);

    return (
        <footer className="flex w-full flex-col">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-4 md:pr-8">
                        <div className="flex items-center justify-start">
                            <span className="text-4xl font-semibold">Botcommerce</span>
                        </div>
                        <p className="text-small text-default-500">
                            {`We are a dedicated online store offering a wide range of high-quality and fun products for kids. Our mission is to bring
                            joy and happiness to every child's life.`}
                        </p>
                        <div className="flex space-x-6">
                            <Link aria-label="Twitter" href={siteConfig.links.twitter}>
                                <TwitterIcon className="text-default-500" size={34} />
                            </Link>
                            <Link aria-label="Twitter" href={siteConfig.links.github}>
                                <GithubIcon className="text-default-500" size={34} />
                            </Link>
                            <Link aria-label="Twitter" href={siteConfig.links.youtube}>
                                <WhatsAppIcon className="text-default-500" size={30} />
                            </Link>
                            <Link aria-label="Twitter" href={siteConfig.links.youtube}>
                                <YoutubeIcon className="text-default-500" size={34} />
                            </Link>
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            {collections?.length > 0 && (
                                <div>
                                    <div>
                                        <h3 className="text-base font-semibold text-default-500">Collections</h3>
                                        <ul className="mt-2 space-y-0.5">
                                            {collections?.slice(0, 6).map((c: any, index: any) => (
                                                <li key={index}>
                                                    <LocalizedClientLink
                                                        className="text-small hover:opacity-80 transition-opacity text-default-500"
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
                            {categories?.length > 0 && (
                                <div className="mt-6 md:mt-0">
                                    <h3 className="text-base font-semibold text-default-500">Categories</h3>
                                    <ul className="mt-2 space-y-1" data-testid="footer-categories">
                                        {categories?.map((c: Category) => {
                                            const children =
                                                c.children?.map((child: Category) => ({
                                                    name: child.name,
                                                    slug: child.slug,
                                                    id: child.id,
                                                })) || null;

                                            return (
                                                <li key={c.id}>
                                                    <LocalizedClientLink
                                                        className="text-small hover:opacity-80 transition-opacity text-default-500"
                                                        data-testid="category-link"
                                                        href={`/collections?cat_ids=${c.slug}`}
                                                    >
                                                        {c.name}
                                                    </LocalizedClientLink>
                                                    {children && (
                                                        <ul className="ml-4">
                                                            {children?.map((child: Category) => (
                                                                <li key={child.id}>
                                                                    <LocalizedClientLink
                                                                        className="text-small hover:opacity-80 transition-opacity text-default-500"
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
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-base font-semibold text-default-500">About Us</h3>
                                <ul className="mt-2 space-y-1">
                                    {about.map((item, index) => (
                                        <li key={index}>
                                            <LocalizedClientLink
                                                className="text-small hover:opacity-80 transition-opacity text-default-500"
                                                href={item.to}
                                            >
                                                {item.label}
                                            </LocalizedClientLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <div>
                                    <h3 className="text-base font-semibold text-default-500">Legal</h3>
                                    <ul className="mt-2 space-y-1">
                                        {legal.map((item, index) => (
                                            <li key={index}>
                                                <LocalizedClientLink
                                                    className="text-small hover:opacity-80 transition-opacity text-default-500"
                                                    href={item.to}
                                                >
                                                    {item.label}
                                                </LocalizedClientLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-10 rounded-medium bg-default-100/20 py-4 sm:my-14 sm:py-8 lg:my-16 lg:flex lg:items-center lg:justify-between lg:gap-2">
                    <div>
                        <h3 className="text-medium font-semibold text-default-500">Subscribe to our newsletter</h3>
                        <p className="mt-2 text-small text-default-500">
                            Receive weekly updates with the newest insights, trends, and tools, straight to your email.
                        </p>
                    </div>
                    <NewsletterForm />
                </div>
                <div className="flex flex-wrap justify-between gap-2 pt-8">
                    <p className="text-small text-default-500">&copy; {new Date().getFullYear()} Online Kiddies Store. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}