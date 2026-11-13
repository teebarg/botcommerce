import { currency } from "@/utils";
import { cn } from "@/utils/cn";
import { getPriceInfo, type PriceInfo } from "@/lib/variant";
import type { ProductVariant } from "@/schemas";

interface PriceLabelProps {
    info?: PriceInfo;
    variant?: ProductVariant;
    /** "light" is for text over photos (product cards), "dark" for normal backgrounds. */
    tone?: "light" | "dark";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZES = {
    sm: { price: "text-base", old: "text-xs", from: "text-2xs" },
    md: { price: "text-lg", old: "text-xs", from: "text-xs" },
    lg: { price: "text-xl", old: "text-xs", from: "text-sm" },
};

const TONES = {
    light: { price: "text-white drop-shadow-sm", muted: "text-white/60" },
    dark: { price: "text-foreground", muted: "text-muted-foreground" },
};

export function PriceLabel({ info, variant, tone = "dark", size = "md", className }: PriceLabelProps) {
    const data = info ?? getPriceInfo({ variants: variant ? [variant] : [] });
    const soldOut = !data.inStock;
    const showFrom = !variant && data.isRange;
    // The struck-through price always belongs to the price shown, and never appears on sold-out items.
    const showOld = !soldOut && data.cheapestHasDiscount;
    const s = SIZES[size];
    const t = TONES[tone];

    return (
        <div className={cn("flex flex-wrap items-baseline gap-x-1.5", className)}>
            {showFrom && <span className={cn(s.from, t.muted)}>From</span>}
            <span className={cn(s.price, t.price, "font-semibold tabular-nums tracking-tight", soldOut && "opacity-60")}>{currency(data.minPrice)}</span>
            {showOld && (
                <s className={cn(s.old, t.muted, "tabular-nums")}>
                    <span className="sr-only">was </span>
                    {currency(data.cheapestCompareAtPrice)}
                </s>
            )}
        </div>
    );
}