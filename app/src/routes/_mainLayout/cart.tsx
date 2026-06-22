import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Tag } from "lucide-react";
import ServerError from "@/components/generic/server-error";
import type { CartItem } from "@/schemas";
import { useCart } from "@/providers/cart-provider";
import EmptyCartMessage from "@/components/store/cart/empty-message";
import { PageLoader } from "@/components/generic/page-loader";
import CartSummary from "@/components/store/cart/cart-summary";
import CartItemComponent from "@/components/store/cart/cart-item";

export const Route = createFileRoute("/_mainLayout/cart")({
    head: () => ({
        meta: [
            { name: "description", content: "Cart" },
            { title: "Cart" },
        ],
    }),
    component: RouteComponent,
});

function PromoBanner() {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 mb-4">
            <Tag className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
                <p className="text-sm font-medium text-amber-900">Mid-season sale — up to 30% off selected items</p>
                <p className="text-xs text-amber-700 mt-0.5">Applied automatically at checkout</p>
            </div>
        </div>
    );
}

function RouteComponent() {
    const { cart, isLoading, error } = useCart();

    if (isLoading) return <PageLoader variant="cart" className="max-w-2xl lg:max-w-5xl mx-auto px-4 py-6 md:py-12 w-full" />;
    if (error) return <ServerError />;
    if (!cart) return <div className="py-24"><EmptyCartMessage /></div>;

    const itemCount = cart.items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

    return (
        <React.Fragment>
            <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 py-6 md:py-12 w-full">
                <PromoBanner />
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                            Your cart ({itemCount} {itemCount === 1 ? "item" : "items"})
                        </p>
                        <div className="rounded-xl border bg-card overflow-hidden">
                            {cart.items.map((item: CartItem) => (
                                <CartItemComponent key={item.variant_id} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-80 lg:sticky lg:top-6 space-y-4 shrink-0">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Cart summary</p>
                        <CartSummary cart={cart} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}