import React from "react";
import { BtnLink } from "./ui/btnLink";

const PromotionalBanner: React.FC = () => {
    return (
        <div className="relative mx-2 md:mx-auto max-w-8xl overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-4 shadow-lg">
            {/* Animated Background Glow */}
            <div className="absolute inset-0 animate-gradient-move opacity-50"></div>

            {/* Banner Content */}
            <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white sm:text-2xl">Big Sale on Top Brands!</h2>
                    <p className="text-sm text-white/90">
                        Get up to <span className="font-bold">50% OFF</span> on select products.
                    </p>
                </div>
                {/* CTA Button */}
                <BtnLink href="/collections" className="!rounded-full bg-white text-sm font-medium text-purple-600 shadow-md !py-2">
                    Shop Now
                </BtnLink>
            </div>
        </div>
    );
};

export default PromotionalBanner;
