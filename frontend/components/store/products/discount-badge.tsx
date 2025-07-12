import React from "react";
import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
    discount: number;
    isFlatPrice?: boolean;
    className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ discount, isFlatPrice = true, className }) => {
    if (discount <= 0) return null;

    const label = isFlatPrice ? `${discount}% off` : `Up to ${discount}% off`;

    return (
        <span className={cn("absolute top-3 left-4 z-10", "bg-red-500 text-white px-3 py-1", "rounded-full text-xs font-bold shadow-lg", className)}>
            {label}
        </span>
    );
};
