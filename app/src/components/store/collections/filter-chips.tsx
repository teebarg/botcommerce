import type React from "react";
import { Sparkles, Flame } from "lucide-react";
import { cn } from "@/utils";

export type DiscoveryFilter = "for-you" | "trending" | "new" | "under-5k";

interface FilterChipsProps {
    value: DiscoveryFilter;
    onChange: (value: DiscoveryFilter) => void;
}

const FILTERS: {
    id: DiscoveryFilter;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}[] = [
        { id: "for-you", label: "For you", icon: Sparkles },
        { id: "trending", label: "Trending", icon: Flame },
        { id: "new", label: "New arrivals" },
        { id: "under-5k", label: "Under ₦5k" },
    ];

const FilterChips: React.FC<FilterChipsProps> = ({ value, onChange }) => {
    return (
        <div
            className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide"
            role="tablist"
            aria-label="Discovery filters"
        >
            {FILTERS.map(({ id, label, icon: Icon }) => {
                const active = value === id;
                return (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(id)}
                        className={cn(
                            "flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                            active
                                ? "bg-primary/10 text-primary border-transparent"
                                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                        )}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterChips;