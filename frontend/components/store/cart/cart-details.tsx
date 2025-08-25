import React from "react";
import { ShoppingCart } from "lucide-react";
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
            <div className="rounded-t-2xl max-h-screen overflow-hidden flex flex-col">
                <div className="p-4 border-b border-default-100 flex justify-between items-center sticky top-safe z-10">
                    <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-default-700" />
                        <h2 className="font-semibold text-lg">Your Cart</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {!cart || cart?.items?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <ShoppingCart className="h-12 w-12 text-default-300 mb-4" />
                            <p className="text-default-500">Your cart is empty</p>
                            <Button className="mt-4 rounded-full" variant="primary" onClick={onClose}>
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
                    <div className="p-4 border-t border-default-300 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-default-600">Subtotal</span>
                            <span>{currency(cart?.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-default-600">Shipping</span>
                            <span>{shippingFee === 0 ? "Free" : `${currency(shippingFee || 0)}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-default-600">Tax</span>
                            <span>{currency(cart?.tax || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-base pt-2">
                            <span>Total</span>
                            <span>{currency(cart?.total || 0)}</span>
                        </div>
                        {path !== "/checkout" && (
                            <BtnLink className="w-full rounded-full font-medium mt-4" href="/checkout" size="lg" variant="primary">
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
