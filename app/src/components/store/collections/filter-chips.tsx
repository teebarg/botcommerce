import type React from "react";
import { Sparkles, Flame } from "lucide-react";
import { cn } from "@/utils";
import { Link } from "@tanstack/react-router";

export type DiscoveryFilter = "for-you" | "trending" | "new-arrivals" | "under-1k";

interface FilterChipsProps {
    value: DiscoveryFilter;
}

const FILTERS: {
    id: DiscoveryFilter;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}[] = [
        { id: "trending", label: "Trending", icon: Flame },
        { id: "new-arrivals", label: "New arrivals" },
    ];

const FilterChips: React.FC<FilterChipsProps> = ({ value }) => {
    const active = true
    return (
        <div
            className="flex gap-2 z-40 overflow-x-auto -mx-2 md:mx-0 px-4 md:px-0 py-2.5 scrollbar-hide sticky top-[calc(var(--sat)+115px)] md:top-[calc(var(--sat)+60px)] bg-background/60 backdrop-blur-md md:bg-background"
            role="tablist"
            aria-label="Discovery filters"
        >
            <Link
                type="button"
                role="tab"
                to="/collections"
                className={cn(
                    "flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    active
                        ? "bg-primary/10 text-primary border-transparent"
                        : "bg-transparent text-foreground border-foreground/50 hover:border-foreground/30"
                )}
            >
                <Sparkles className="w-3.5 h-3.5" />
                For you
            </Link>
            {FILTERS.map(({ id, label, icon: Icon }) => {
                const active = value === id;
                return (
                    <Link
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        to="/collections/$slug"
                        params={{ slug: id }}
                        className={cn(
                            "flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                            active
                                ? "bg-primary/10 text-primary border-transparent"
                                : "bg-transparent text-foreground border-foreground/50 hover:border-foreground/30"
                        )}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                    </Link>
                );
            })}
            <Link
                type="button"
                role="tab"
                to="/collections"
                search={{ min_price: 1, max_price: 1000 }}
                className={cn(
                    "flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    active
                        ? "bg-primary/10 text-primary border-transparent"
                        : "bg-transparent text-foreground border-foreground/50 hover:border-foreground/30"
                )}
            >
                Under ₦1k
            </Link>
        </div>
    );
};

export default FilterChips;