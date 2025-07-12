import React from "react";
import { currency } from "@/lib/utils";

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
}

export const PriceLabel: React.FC<PriceLabelProps> = ({ priceInfo, className }) => {
    const { minPrice, maxPrice, maxCompareAtPrice, hasDiscount, allDiscounted, maxDiscountPercent } = priceInfo;

    if (minPrice === maxPrice) {
        if (hasDiscount && allDiscounted) {
            return (
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-default-900">{currency(minPrice)}</span>
                    <span className="text-sm text-default-500 line-through">{currency(maxCompareAtPrice!)}</span>
                </div>
            );
        }

        if (hasDiscount) {
            return (
                <div className={`text-default-900 text-xl font-bold ${className}`}>
                    From <span className="font-semibold">{currency(minPrice)}</span>
                </div>
            );
        }

        return <div className={`text-default-900 text-xl font-bold ${className}`}>{currency(minPrice)}</div>;
    }

    return (
        <div className={`text-default-900 text-xl font-bold ${className}`}>
            {hasDiscount ? (
                <span>
                    From {currency(minPrice)} to {currency(maxPrice)}
                </span>
            ) : (
                <span>
                    From {currency(minPrice)} to {currency(maxPrice)}
                </span>
            )}
        </div>
    );
};
