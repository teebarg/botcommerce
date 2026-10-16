import { LayoutGrid, Square } from "lucide-react";
import { cn } from "@/utils/cn";
import { type FeedView } from "@/hooks/useFeedUi";
import { useLocation } from "@tanstack/react-router";

interface FloatingViewToggleProps {
    view: FeedView;
    onChange: (view: FeedView) => void;
}

export function FloatingViewToggle({ view, onChange }: FloatingViewToggleProps) {
    const location = useLocation();
    const show = location.pathname.startsWith("/collections");
    if (!show) {
        return null;
    }
    const next: FeedView = view === "list" ? "grid" : "list";
    const Icon = next === "grid" ? LayoutGrid : Square;

    return (
        <button
            type="button"
            onClick={() => onChange(next)}
            aria-label={next === "grid" ? "Switch to two columns" : "Switch to single column"}
            style={{ bottom: "calc(var(--bottom-nav-h, 0px) * var(--chrome-visible, 1) + var(--quick-bar-h, 0px) + 1rem)" }}
            className={cn(
                "fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg",
                "transition-all duration-300 motion-reduce:transition-none md:hidden",
                "[html[data-chrome-hidden]_&]:pointer-events-none [html[data-chrome-hidden]_&]:translate-y-4 [html[data-chrome-hidden]_&]:opacity-0"
            )}
        >
            <Icon className="h-5 w-5" />
        </button>
    );
}
