import { Link } from "@tanstack/react-router";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { currency } from "@/utils";
import { useCartSummary } from "@/hooks/useCartSummary";
import { useEffect, useRef } from "react";

export function StickyCartBar() {
    const { subtotal, totalItems, isLoading } = useCartSummary();
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading || totalItems === 0) {
            document.documentElement.style.setProperty("--cart-bar-bottom", "var(--nav-height)");
            return;
        }
        if (!barRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.borderBoxSize[0].blockSize;
                document.documentElement.style.setProperty(
                    "--cart-bar-bottom",
                    `calc(var(--nav-height) + ${height}px)`
                );
            }
        });

        observer.observe(barRef.current);

        return () => observer.disconnect();
    }, [isLoading, totalItems]);

    if (isLoading || totalItems === 0) return null;

    return (
        <div
            ref={barRef}
            className="md:hidden sticky z-30 flex items-center justify-between bg-background/60 backdrop-blur-md
             px-6 py-3 shadow-sm animate-in slide-in-from-top-2 duration-300"
            style={{ top: "var(--nav-height)" }}
        >
            <div className="flex items-center gap-2.5">
                <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                    <span
                        className="
                            absolute -top-1.5 -right-1.5
                            bg-accent text-accent-foreground
                            text-2xs font-medium
                            w-4 h-4 rounded-full
                            flex items-center justify-center
                        "
                    >
                        {totalItems}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-semibold text-sm text-foreground">
                        {currency(subtotal)}
                    </span>
                    <span className="text-2xs text-muted-foreground">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                </div>
            </div>
            <Link
                to="/checkout"
                className="
                    flex items-center gap-1.5
                    bg-accent text-accent-foreground
                    text-xs font-medium
                    px-3.5 py-1.5 rounded-lg
                    transition-opacity hover:opacity-90 active:opacity-75
                "
            >
                Checkout
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}