import React from "react";

import { BtnLink } from "@/components/ui/btnLink";
import { cn } from "@/lib/util/cn";

interface Props {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    outerClass?: string;
    btnClass?: string;
}

const PromotionalBanner: React.FC<Props> = ({ title, subtitle, icon, outerClass, btnClass }) => {
    return (
        <div
            className={cn(
                "bg-gradient-to-r from-blue-600 to-purple-700 p-4 mx-2 mb-2 rounded-xl shadow-lg flex items-center justify-between overflow-hidden",
                outerClass
            )}
        >
            <div className="flex items-center space-x-3">
                {icon}
                <div>
                    <h3 className="text-white font-bold text-base animate-fade-in-up">{title}</h3>
                    <p className="text-white/80 text-xs animate-fade-in-up delay-100">{subtitle}</p>
                </div>
            </div>
            {/* CTA Button */}
            <BtnLink className={cn("bg-white text-blue-600 py-2 !rounded-full flex items-center text-sm font-semibold", btnClass)} href="/">
                <span>Shop Now</span>
            </BtnLink>
        </div>
    );
};

export default PromotionalBanner;
