import type React from "react";
import MobileFilter from "@/components/store/mobile-filter";
import ShareButton from "@/components/share";
import { useLocation } from "@tanstack/react-router";
import { useShowOnScrollUp } from "@/hooks/useShowOnScrollUp";
import { cn } from "@/utils/cn";

export const FloatingActionDeck: React.FC = () => {
    const visible = useShowOnScrollUp();
    const location = useLocation();
    const show = location.pathname.startsWith("/collections");
    if (!show) {
        return null;
    }
    return (
        <div
            className={cn(
                "fixed right-4 z-50 flex flex-col gap-3 md:hidden",
                "transition-all duration-300 motion-reduce:transition-none",
                visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            )}
            style={{ bottom: "calc(var(--bottom-nav-h, 0px) + var(--quick-bar-h, 0px) + 6rem)" }}
        >
            <ShareButton />
            <MobileFilter />
        </div>
    );
};

export default FloatingActionDeck;
