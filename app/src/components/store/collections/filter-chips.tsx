import type React from "react";
import { Sparkles, Flame } from "lucide-react";
import { cn } from "@/utils";
import { Link, useLocation, useSearch } from "@tanstack/react-router";

type DiscoveryFilter = "for-you" | "trending" | "new-arrivals" | "under-1k";

type FilterDef = {
    id: DiscoveryFilter;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive: (pathname: string, search: Record<string, string>) => boolean;
} & (
    | { to: "/collections"; params?: never; search?: Record<string, number> }
    | { to: "/collections/$slug"; params: { slug: string }; search?: never }
);

const FILTERS: FilterDef[] = [
    // {
    //     id: "for-you",
    //     label: "For you",
    //     icon: Sparkles,
    //     to: "/collections",
    //     isActive: (pathname, search) =>
    //         pathname === "/collections" && !search.slug && !search.min_price,
    // },
    {
        id: "trending",
        label: "Trending",
        icon: Flame,
        to: "/collections/$slug",
        params: { slug: "trending" },
        isActive: (pathname, _) => pathname == "/collections/trending",
    },
    {
        id: "new-arrivals",
        label: "New arrivals",
        icon: Sparkles,
        to: "/collections/$slug",
        params: { slug: "new-arrivals" },
        isActive: (pathname, _) => pathname == "/collections/new-arrivals",
    },
    {
        id: "under-1k",
        label: "Under ₦1k",
        to: "/collections",
        search: { min_price: 1, max_price: 1000 },
        isActive: (_, search) => search.min_price == "1" && search.max_price == "1000",
    },
];

const chipCn = (active: boolean) =>
    cn(
        "flex items-center gap-1 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
        active
            ? "bg-destructive/20 text-destructive border-transparent"
            : "bg-transparent text-foreground border-foreground/30 hover:border-foreground/30"
    );

const FilterChips = () => {
    const { pathname } = useLocation();
    const search = useSearch({ strict: false }) as Record<string, string>;

    return (
        <div
            className="flex gap-1 z-50 overflow-x-auto -mx-2 md:mx-0 px-2 md:px-0 py-3.5 scrollbar-hide sticky glass"
            style={{ top: "var(--nav-height)" }}
            role="tablist"
            aria-label="Discovery filters"
        >
            {FILTERS.map(({ id, label, icon: Icon, to, params, search: linkSearch, isActive }) => {
                const active = isActive(pathname, search);
                return (
                    <Link
                        key={id}
                        role="tab"
                        aria-selected={active}
                        to={to}
                        params={params}
                        search={linkSearch}
                        className={chipCn(active)}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                    </Link>
                );
            })}
        </div>
    );
};

export default FilterChips;