import { createFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { Shield, Tag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";
import ServerError from "@/components/generic/server-error";
import type { CartItem } from "@/schemas";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";
import EmptyCartMessage from "@/components/store/cart/empty-message";
import { Separator } from "@/components/ui/separator";
import { currency } from "@/utils";
import ImageDisplay from "@/components/image-display";
import { useChangeCartQuantity, useDeleteCartItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

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

function CartItemRow({ item }: { item: CartItem }) {
    const updateQuantity = useChangeCartQuantity();
    const deleteItem = useDeleteCartItem();

    const onUpdateQuantity = async (id: number, quantity: number) => {
        await updateQuantity.mutateAsync({ item_id: id, quantity });
    };

    const removeItem = async (id: number) => {
        deleteItem.mutateAsync(id);
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
            <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <ImageDisplay className="rounded-lg" url={item?.image} alt={item.name} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {[
                            item.variant.size && `Size: ${item.variant.size}`,
                            item.variant.color && `Color: ${item.variant.color}`,
                            item.variant.width && `Width: ${item.variant.width}`,
                            item.variant.length && `Length: ${item.variant.length}`,
                            item.variant.age && `Age: ${item.variant.age}`,
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-sm font-medium">{currency(item.price * item.quantity)}</span>
                <Button disabled={deleteItem.isPending} isLoading={deleteItem.isPending} size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
            </div>
        </div>
    );
}

function OrderSummary({ cart }: { cart: NonNullable<ReturnType<typeof useCart>["cart"]> }) {
    const router = useRouter();
    const subtotal = cart.items.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
    const discount = cart.discount_amount;

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
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
                {discount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-amber-700">Sale discount</span>
                        <span className="font-medium text-amber-700">−{currency(discount)}</span>
                    </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{currency(cart?.total || 0)}</span>
                </div>
            </div>

            <button onClick={() => router.navigate({ to: "/checkout" })} className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                Proceed to checkout
                <ArrowRight className="w-4 h-4" />
            </button>

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
        </div>
    );
}

function RouteComponent() {
    const { cart, isLoading, error } = useCart();

    if (isLoading) return <ComponentLoader className="h-[400px]" />;
    if (error) return <ServerError />;
    if (!cart) return <div className="py-24"><EmptyCartMessage /></div>;

    const product_ids = cart.items.map((x: CartItem) => x.variant_id);
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
                                <CartItemRow key={item.variant_id} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-80 lg:sticky lg:top-6 space-y-4 shrink-0">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Order summary</p>
                        <OrderSummary cart={cart} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}