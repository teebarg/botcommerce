import type React from "react";
import { currency } from "@/utils";
import type { Cart } from "@/schemas";
import { ArrowRight, Shield } from "lucide-react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { useCartSummary } from "@/hooks/useCartSummary";
import { cn } from "@/utils/cn";

const CartSummary: React.FC<{ cart: Cart, className?: string, showSecured?: boolean }> = ({ cart, className, showSecured = false }) => {
    const router = useRouter();
    const routerState = useRouterState();
    const { subtotal, discountAmount } = useCartSummary();
    const path = routerState.location.pathname;

    return (
        <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
            <div className="px-4 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{cart?.shipping_fee === 0 ? "Free" : `${currency(cart?.shipping_fee || 0)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{currency(cart?.tax || 0)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-destructive">Sale discount</span>
                        <span className="font-medium text-destructive">−{currency(discountAmount)}</span>
                    </div>
                )}
                {cart?.wallet_used > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wallet Used</span>
                        <span className="font-medium text-primary">-{currency(cart?.wallet_used)}</span>
                    </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{currency(cart?.total || 0)}</span>
                </div>
            </div>

            {path !== "/checkout" && (
                <button onClick={() => router.navigate({ to: "/checkout" })} className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    Proceed to checkout
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}

            {showSecured && (
                <div className="flex items-center gap-2 px-4 py-2.5 border-t">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Secure checkout</span>
                    <div className="flex gap-1.5 ml-auto">
                        {["Safe payments", "Privacy protected"].map((label) => (
                            <span
                                key={label}
                                className="text-[11px] text-muted-foreground border rounded-full px-2 py-0.5 bg-muted/40"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartSummary;
