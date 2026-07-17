import { createLazyFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Tag } from "lucide-react";
import ServerError from "@/components/generic/server-error";
import type { CartItem } from "@/schemas";
import { PageLoader } from "@/components/generic/page-loader";
import CartSummary from "@/components/store/cart/cart-summary";
import CartItemComponent from "@/components/store/cart/cart-item";
import EmptyState from "@/components/generic/empty";
import { BtnLink } from "@/components/ui/btnLink";
import { useCartSummary } from "@/hooks/useCartSummary";

export const Route = createLazyFileRoute("/_mainLayout/cart")({
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
    const { cart, isLoading, error, totalItems } = useCartSummary();

    if (isLoading) return <PageLoader variant="cart" className="max-w-5xl mx-auto px-4 py-6" />;
    if (error) return <ServerError stack={error} scenario="cart page" />;
    if (!cart) {
        return <EmptyState
            title="Your cart is empty"
            description="Continue shopping to explore more."
            action={
                <BtnLink className="mt-4 rounded-full text-sm" href="/collections">
                    Continue Shopping
                </BtnLink>
            }
            icon={ShoppingCart}
        />
    }

    return (
        <div className="max-w-5xl mx-auto w-full px-4 py-6">
            <PromoBanner />
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                        Your cart ({totalItems} {totalItems === 1 ? "item" : "items"})
                    </p>
                    <div className="rounded-xl border bg-card overflow-hidden">
                        {cart?.items.map((item: CartItem) => (
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
    );
}