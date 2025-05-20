import React from "react";
import Link from "next/link";
import { getSiteConfig } from "@lib/config";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Latest News",
};

interface NewsItem {
    id: number;
    title: string;
    date: string;
    excerpt: string;
}

export default async function LatestNews() {
    const siteConfig = await getSiteConfig();

    const newsItems: NewsItem[] = [
        {
            id: 1,
            title: `${siteConfig.name} Launches New Eco-Friendly Product Line`,
            date: "2023-04-15",
            excerpt: "We're excited to announce our latest range of sustainable products...",
        },
        {
            id: 2,
            title: `${siteConfig.name} Grand Opening: ${siteConfig.name} Store in Downtown Metro`,
            date: "2023-04-10",
            excerpt: "Join us for the grand opening of our newest location in the heart of the city...",
        },
        {
            id: 3,
            title: `${siteConfig.name} Launches New Mobile App`,
            date: "March 15, 2024",
            excerpt: "Shop on-the-go with our new mobile app, featuring personalized recommendations and exclusive deals.",
        },
        {
            id: 4,
            title: "Expansion into Sustainable Home Products",
            date: "February 28, 2024",
            excerpt: "We're excited to announce our new line of eco-friendly home products, sourced from responsible manufacturers.",
        },
        {
            id: 5,
            title: "Customer Appreciation Week Coming Soon",
            date: "February 10, 2024",
            excerpt: "Mark your calendars for our annual Customer Appreciation Week, featuring amazing discounts and special events.",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Latest News from {siteConfig.name}</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {newsItems.map((item, idx: number) => (
                    <div key={idx} className="bg-content1 rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h2>
                            <p className="text-default-500 text-sm mb-4">{item.date}</p>
                            <p className="mb-4 text-foreground">{item.excerpt}</p>
                            <Link className="text-blue-600 hover:underline" href={`/news/${item.id}`}>
                                Read more
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
