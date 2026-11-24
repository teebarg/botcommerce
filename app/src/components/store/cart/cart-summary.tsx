import type React from "react";
import { currency } from "@/utils";
import { ArrowRight, MessageCircle, Shield } from "lucide-react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";
import { useCart } from "@/providers/cart-provider";
import { useConfig } from "@/providers/store-provider";
import { variantLabel } from "@/lib/variant";

const CartSummary: React.FC<{ className?: string; showSecured?: boolean }> = ({ className, showSecured = false }) => {
    const router = useRouter();
    const routerState = useRouterState();
    const { cart } = useCart();
    const { whatsapp } = useConfig();
    const path = routerState.location.pathname;

    const orderViaWhatsApp = () => {
        if (!cart?.items.length || !whatsapp) return;
        const lines = cart.items.map((item, index) => {
            const details = variantLabel(item.variant);
            const name = details ? `${item.name} (${details})` : item.name;
            return `${index + 1}. ${name} × ${item.quantity} — ${currency(item.variant.price * item.quantity)}\n${window.location.origin}/products/${item.slug}`;
        });
        const message = `Hello! I'd like to order these items:\n\n${lines.join("\n\n")}\n\nSubtotal: ${currency(cart.subtotal)}\n\nPlease confirm availability and delivery fee. Thank you!`;
        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
            <div className="px-4 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{currency(cart?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{cart?.shipping_fee === 0 ? "Free" : `${currency(cart?.shipping_fee || 0)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{currency(cart?.tax || 0)}</span>
                </div>
                {Boolean(cart?.discount_amount) && (
                    <div className="flex justify-between text-sm">
                        <span className="text-destructive">Sale discount</span>
                        <span className="font-medium text-destructive">−{currency(cart?.discount_amount || 0)}</span>
                    </div>
                )}
                {Boolean(cart?.wallet_used) && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wallet Used</span>
                        <span className="font-medium text-primary">-{currency(cart?.wallet_used || 0)}</span>
                    </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{currency(cart?.total || 0)}</span>
                </div>
            </div>

            {path !== "/checkout" && cart?.items.length ? (
                <div className="grid gap-2 p-3 pt-0">
                    <button
                        onClick={() => router.navigate({ to: "/checkout" })}
                        className="w-full flex items-center justify-center gap-2 rounded-lg py-3 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Proceed to checkout
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={orderViaWhatsApp}
                        disabled={!whatsapp}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-700 py-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Order via WhatsApp
                    </button>
                </div>
            ) : null}

            {showSecured && (
                <div className="flex items-center gap-2 px-4 py-2.5 border-t">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Secure checkout</span>
                    <div className="flex gap-1.5 ml-auto">
                        {["Safe payments", "Privacy protected"].map((label) => (
                            <span key={label} className="text-[11px] text-muted-foreground border rounded-full px-2 py-0.5 bg-muted/40">
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
