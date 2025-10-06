import React from "react";
import { Info, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

import CartItemComponent from "./cart-item";

import { Cart, CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BtnLink } from "@/components/ui/btnLink";
import ClientOnly from "@/components/generic/client-only";

interface Props {
    onClose?: () => void;
    cart: Cart | null;
    shippingFee?: number;
}

const CartDetails: React.FC<Props> = ({ onClose, cart, shippingFee }) => {
    const path = usePathname();

    return (
        <ClientOnly>
            <div className="rounded-t-2xl min-h-[70vh] max-h-screen overflow-hidden flex flex-col justify-center">
                <div className="p-4 border-b border-border flex justify-between items-center sticky top-safe z-10">
                    <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        <h2 className="font-semibold text-lg">Your Cart</h2>
                    </div>
                </div>

                {cart?.items?.length && (
                    <p className="bg-secondary text-foreground p-2 rounded flex gap-2 mx-4 mt-4" data-testid="miniBag-urgentMessage-read">
                        <Info className="text-muted-foreground" />
                        <span className="text-sm">
                            <span className="font-semibold">{`Your items aren’t reserved`}</span>,{" "}
                            {`checkout quickly to make sure you don’t miss out.`}
                        </span>
                    </p>
                )}

                <div className="flex-1 overflow-y-auto p-4">
                    {!cart || cart?.items?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
                            <p className="text-foreground font-semibold text-2xl">Your cart is empty</p>
                            <p className="text-muted-foreground">Add items to your cart to view them here.</p>
                            <Button className="mt-4 rounded-full" onClick={onClose}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cart?.items?.map((item: CartItem, idx: number) => <CartItemComponent key={idx} item={item} />)}
                        </div>
                    )}
                </div>

                {cart?.items?.length && (
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{currency(cart?.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>{shippingFee === 0 ? "Free" : `${currency(shippingFee || 0)}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>{currency(cart?.tax || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-base pt-2">
                            <span>Total</span>
                            <span>{currency(cart?.total || 0)}</span>
                        </div>
                        {path !== "/checkout" && (
                            <BtnLink className="w-full rounded-full font-medium mt-4" href="/checkout" size="lg">
                                Checkout
                            </BtnLink>
                        )}
                        <button className="w-full text-primary py-2 text-sm hover:underline" onClick={onClose}>
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </ClientOnly>
    );
};

export default CartDetails;
