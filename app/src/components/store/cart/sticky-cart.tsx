import { useCart } from "@/providers/cart-provider";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, ArrowRight } from "lucide-react";
import type { CartItem } from "@/schemas";
import { currency } from "@/utils";

export function StickyCartBar() {
    const { cart, isLoading } = useCart();

    const totalItems =
        cart?.items?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0) ?? 0;

    const totalAmount =
        cart?.items?.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0) ?? 0;

    if (isLoading || totalItems === 0) return null;

    return (
        <div
            className="
                md:hidden
                sticky z-30
                mx-3 mb-1
                flex items-center justify-between
                rounded-xl border border-border
                bg-card px-4 py-2.5
                shadow-sm
                animate-in slide-in-from-top-2 duration-300
            "
            style={{ top: "calc(var(--sat) + 62.75px)" }}
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
                        {currency(totalAmount)}
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