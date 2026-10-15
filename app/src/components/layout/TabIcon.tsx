import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Shared look for every item in the mobile bottom nav (links AND buttons), so they all
 * behave the same: the whole item (icon + label) is one tap target, at least 48px tall.
 *
 * Active state is driven by `data-status="active"`:
 *  - TanStack Router's <Link> sets it automatically (plus aria-current="page")
 *  - buttons (Cart, Menu) set it themselves while their overlay is open
 */
export const TAB_ITEM_CLASS =
    "group flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:text-foreground";

export function TabIcon({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "relative flex h-9 w-14 items-center justify-center rounded-xl transition-colors group-data-[status=active]:bg-gradient-primary group-data-[status=active]:text-white",
                className
            )}
        >
            {children}
        </span>
    );
}
