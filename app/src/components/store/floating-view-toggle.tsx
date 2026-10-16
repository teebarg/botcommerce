import { LayoutGrid, Square } from "lucide-react";
import { cn } from "@/utils/cn";
import { type FeedView } from "@/hooks/useFeedUi";
import { useShowOnScrollUp } from "@/hooks/useShowOnScrollUp";

interface FloatingViewToggleProps {
    view: FeedView;
    onChange: (view: FeedView) => void;
}

export function FloatingViewToggle({ view, onChange }: FloatingViewToggleProps) {
    const visible = useShowOnScrollUp();
    const next: FeedView = view === "list" ? "grid" : "list";
    const Icon = next === "grid" ? LayoutGrid : Square;

    return (
        <button
            type="button"
            onClick={() => onChange(next)}
            aria-label={next === "grid" ? "Switch to two columns" : "Switch to single column"}
            style={{ bottom: "calc(var(--bottom-nav-h, 0px) + var(--quick-bar-h, 0px) + 1rem)" }}
            className={cn(
                "fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg",
                "transition-all duration-300 motion-reduce:transition-none md:hidden",
                visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            )}
            tabIndex={visible ? 0 : -1}
        >
            <Icon className="h-5 w-5" />
        </button>
    );
}