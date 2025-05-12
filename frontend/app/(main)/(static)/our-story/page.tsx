import { getSiteConfig } from "@lib/config";
import React from "react";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Our Story",
};

const OurStory = async () => {
    const siteConfig = await getSiteConfig();

    return (
        <div className="max-w-6xl mx-auto bg-content1 p-8 rounded-lg shadow-lg">
            <div className="mb-12">
                <p className="text-xl text-foreground italic">
                    {`"From a small garage to a nationwide e-commerce platform, our journey has been nothing short of extraordinary."`}
                </p>
            </div>

            <div className="mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Humble Beginnings</h2>
                <p>
                    {siteConfig.name} was founded in 2024 with a simple mission: to provide high-quality products at affordable prices. Our journey
                    began in a small garage, where we started selling handcrafted items to our local community.
                </p>
            </div>

            <div className="mb-12">
                <h2 className="text-3xl font-bold mb-4">Growing with Our Customers</h2>
                <p>
                    {`Over the years, we've grown from that humble beginning into a nationwide e-commerce platform, but our core values remain the same.
                    We're committed to:`}
                </p>
                <ul className="list-disc pl-6 mt-4">
                    <li>Exceptional customer service</li>
                    <li>Sustainable and ethical sourcing</li>
                    <li>Supporting local artisans and manufacturers</li>
                    <li>Continuously innovating to meet our customers needs</li>
                </ul>
            </div>

            <div>
                <h2 className="text-3xl font-bold mb-4">Looking to the Future</h2>
                <p>
                    {`Today, ${siteConfig.name} is proud to serve millions of customers across the country, offering a wide range of products from home
                    goods to electronics. We're excited about the future and look forward to continuing our journey with you, our valued customers.`}
                </p>
                <div className="mt-8 bg-blue-100 p-6 rounded-lg">
                    <p className="text-lg font-semibold text-blue-800">
                        Join us in shaping the future of e-commerce. Your satisfaction and trust drive us to be better every day.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OurStory;
