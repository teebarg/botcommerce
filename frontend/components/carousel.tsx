"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight } from "nui-react-icons";
import Image from "next/image";

import { cn } from "@/lib/util/cn";

interface Banner {
    image: string;
    title: string;
    subtitle: string;
    link: string;
}

const banners: Banner[] = [
    {
        image: "https://firebasestorage.googleapis.com/v0/b/shopit-ebc60.appspot.com/o/banners%2Fbanner2.jpg?alt=media",
        title: "Luxury Collection",
        subtitle: "Timeless Elegance Awaits",
        link: "/collections",
    },
    {
        image: "https://bzjitsvxyblegrvtzvef.supabase.co/storage/v1/object/public/banners/tbo-banner-2.avif",
        title: "Exclusive Designs",
        subtitle: "Crafted for the Discerning",
        link: "/collections",
    },
    {
        image: "https://firebasestorage.googleapis.com/v0/b/shopit-ebc60.appspot.com/o/banners%2Fbanner1.jpg?alt=media",
        title: "Limited Edition",
        subtitle: "Rare Pieces, Unmatched Quality",
        link: "/collections",
    },
];

const BannerCarousel: React.FC = () => {
    const [currentBanner, setCurrentBanner] = useState<number>(0);

    useEffect(() => {
        const rotationInterval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 3000);

        return () => clearInterval(rotationInterval);
    }, []);

    return (
        <div className="relative w-full min-h-[500px] h-full overflow-hidden rounded-md">
            {banners.map((banner, index) => (
                <div
                    key={index}
                    className={cn("absolute inset-0 transition-opacity duration-1000", index === currentBanner ? "opacity-100" : "opacity-0")}
                >
                    <Image
                        fill
                        priority
                        alt={banner.title}
                        className="w-full h-full object-cover absolute"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={banner.image}
                    />
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center">
                        <div className="text-center text-white max-w-2xl px-4">
                            <h1 className="text-5xl font-bold mb-4">{banner.title}</h1>
                            <p className="text-2xl mb-8">{banner.subtitle}</p>
                            <a
                                className="inline-flex items-center bg-white text-gray-800 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
                                href={banner.link}
                            >
                                Shop Collection
                                <ArrowRight className="ml-2" />
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* Indicator Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        aria-label="indicator"
                        className={cn(
                            "w-3 h-3 rounded-full transition-all",
                            index === currentBanner ? "bg-white scale-125" : "bg-white/50 hover:bg-white"
                        )}
                        onClick={() => setCurrentBanner(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
