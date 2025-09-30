import React from "react";

import { cn, currency } from "@/lib/utils";

type PriceInfo = {
    minPrice: number;
    maxPrice: number;
    minCompareAtPrice: number | null;
    maxCompareAtPrice: number | null;
    hasDiscount: boolean | undefined;
    allDiscounted: boolean | undefined;
    maxDiscountPercent: number;
};

interface PriceLabelProps {
    priceInfo: PriceInfo;
    className?: string;
    priceClassName?: string;
    oldPriceClassName?: string;
}

export const PriceLabel: React.FC<PriceLabelProps> = ({
    priceInfo,
    className,
    priceClassName = "text-default-900",
    oldPriceClassName = "text-default-500",
}) => {
    const { minPrice, maxPrice, maxCompareAtPrice, hasDiscount, allDiscounted } = priceInfo;

    if (minPrice === maxPrice) {
        if (hasDiscount && allDiscounted) {
            return (
                <div className="flex items-center space-x-2">
                    <span className={cn("text-xl font-bold", priceClassName)}>{currency(minPrice)}</span>
                    <span className={cn("line-through text-default-500", oldPriceClassName)}>{currency(maxCompareAtPrice!)}</span>
                </div>
            );
        }

        if (hasDiscount) {
            return (
                <div className={cn("text-xl font-bold", className, priceClassName)}>
                    <span className="text-sm">From</span> <span className="font-semibold">{currency(minPrice)}</span>
                </div>
            );
        }

        return <div className={cn("text-xl font-bold", className)}>{currency(minPrice)}</div>;
    }

    return (
        <div className={cn("text-xl font-bold", className, priceClassName)}>
            {hasDiscount ? (
                <span>
                    <span className="text-sm">From</span> {currency(minPrice)} <span className="text-sm">to</span> {currency(maxPrice)}
                </span>
            ) : (
                <span>
                    <span className="text-sm">From</span> {currency(minPrice)} <span className="text-sm">to</span> {currency(maxPrice)}
                </span>
            )}
        </div>
    );
};
