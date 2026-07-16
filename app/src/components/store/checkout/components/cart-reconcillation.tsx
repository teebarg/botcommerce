import { useState } from "react";
import { ChevronDown, ChevronUp, Package, AlertTriangle } from "lucide-react";
import type { Cart, CartItem } from "@/schemas";
import { currency } from "@/utils";
import CartSummary from "../../cart/cart-summary";
import CartItemComponent from "../../cart/cart-item";
import { cn } from "@/utils/cn";

interface OrderReconciliationProps {
    cart: Cart;
}

export function OrderReconciliation({ cart }: OrderReconciliationProps) {
    const [expanded, setExpanded] = useState(true);

    const items = cart.items ?? [];
    const outOfStockItems = items.filter((item: CartItem) => item.variant?.status === "OUT_OF_STOCK");
    const isBlocked = outOfStockItems.length > 0;

    return (
        <div className={cn("space-y-2 hidden md:hidden mb-2", isBlocked && "block")}>
            {isBlocked && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-destructive">Action required</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {outOfStockItems.length === 1
                                ? "1 item in your cart is out of stock."
                                : `${outOfStockItems.length} items in your cart are out of stock.`}{" "}
                            Remove {outOfStockItems.length === 1 ? "it" : "them"} to continue.
                        </p>
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                    type="button"
                    onClick={() => setExpanded((p) => !p)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">Order summary</span>
                        <span className="text-xs text-muted-foreground">
                            ({items.length} {items.length === 1 ? "item" : "items"})
                        </span>
                        {isBlocked && (
                            <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-md font-medium">
                                {outOfStockItems.length} unavailable
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{currency(cart.total)}</span>
                        {expanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        }
                    </div>
                </button>

                <div className={cn("border-t border-border", !expanded && "hidden")}>
                    <div className="flex-1 bg-card overflow-y-auto">
                        {cart?.items?.map((item: CartItem) => (
                            <CartItemComponent key={item.variant_id} item={item} />
                        ))}
                    </div>
                    <CartSummary cart={cart!} className="rounded-none border-none" />
                </div>
            </div>
        </div>
    );
}