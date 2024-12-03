"use client";

import React, { useState, useEffect } from "react";
import { ArrrowRight } from "nui-react-icons";

interface Banner {
    image: string;
    title: string;
    subtitle: string;
    link: string;
}

const banners: Banner[] = [
    {
        image: "/api/placeholder/1920/800",
        title: "Luxury Collection",
        subtitle: "Timeless Elegance Awaits",
        link: "/collections",
    },
    {
        image: "/api/placeholder/1920/800",
        title: "Exclusive Designs",
        subtitle: "Crafted for the Discerning",
        link: "/collections",
    },
    {
        image: "/api/placeholder/1920/800",
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
        }, 2000);

        return () => clearInterval(rotationInterval);
    }, []);

    return (
        <div className="relative w-full h-[600px] overflow-hidden">
            {banners.map((banner, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? "opacity-100" : "opacity-0"}`}
                >
                    <img alt={banner.title} className="w-full h-full object-cover absolute" src={banner.image} />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-center text-white max-w-2xl px-4">
                            <h1 className="text-5xl font-bold mb-4">{banner.title}</h1>
                            <p className="text-2xl mb-8">{banner.subtitle}</p>
                            <a
                                className="inline-flex items-center bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
                                href={banner.link}
                            >
                                Shop Collection
                                <ArrrowRight className="ml-2" />
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* Indicator Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all
                            ${index === currentBanner ? "bg-white scale-125" : "bg-white/50 hover:bg-white"}`}
                        onClick={() => setCurrentBanner(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
