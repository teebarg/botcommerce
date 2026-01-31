import type React from "react";

import { cn } from "@/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Flame, Zap } from "lucide-react";

const iconMap = {
    sale: Flame,
    electric: Zap,
};

export interface DiscountBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof discountBadgeVariants> {
    discount: number;
    isFlatPrice?: boolean;
    className?: string;
    label?: string;
    showIcon?: boolean;
}

const discountBadgeVariants = cva(
    "absolute top-3 right-3 z-10 font-bold text-white transition-all duration-300 flex items-center gap-1.5 overflow-hidden",
    {
        variants: {
            variant: {
                sale: [
                    "bg-gradient-action px-3 py-1.5 rounded-lg",
                    "shadow-[var(--shadow-discount)_hsl(var(--discount-sale-glow)/0.5)]",
                    "hover:shadow-[var(--shadow-intense)_hsl(var(--discount-sale-glow)/0.8)]",
                    "hover:scale-110",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
                    "before:animate-shimmer before:bg-[length:200%_100%]",
                ],
                electric: [
                    "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 px-3 py-1.5",
                    "rounded-lg shadow-[0_0_25px_rgba(0,200,255,0.7)]",
                    "hover:shadow-[0_0_40px_rgba(0,200,255,1)]",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent",
                    "before:animate-shimmer before:bg-[length:200%_100%]",
                    "hover:scale-110 hover:-rotate-2",
                ],
            },
            size: {
                sm: "px-2 py-1 text-xs",
                md: "px-3 py-1.5 text-sm",
                lg: "px-4 py-2 text-base",
            },
        },
        defaultVariants: {
            variant: "sale",
            size: "md",
        },
    }
);

export function DiscountBadge({ discount, isFlatPrice = true, className, variant, size, showIcon = true, ...props }: DiscountBadgeProps) {
    const content = isFlatPrice ? `-${discount}% off` : `Up to ${discount}% off`;
    const Icon = variant ? iconMap[variant] : null;

    if (discount <= 0) return null;

    return (
        <div className={cn(discountBadgeVariants({ variant, size }), className)} {...props}>
            <span className="relative z-10 flex items-center gap-1.5">
                {showIcon && Icon && <Icon className="w-4 h-4" />}
                <span className="font-bold tracking-wide">{content}</span>
            </span>
        </div>
    );
}
