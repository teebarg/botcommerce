import type React from "react";
import { ArrowRight, Info, ShoppingCart } from "lucide-react";
import CartItemComponent from "./cart-item";
import { useRouter, useRouterState } from "@tanstack/react-router";
import type { Cart } from "@/schemas";
import { Button } from "@/components/ui/button";
import { currency } from "@/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    onClose?: () => void;
    cart: Cart | null;
    shippingFee?: number;
}

const CartDetails: React.FC<Props> = ({ onClose, cart, shippingFee }) => {
    const router = useRouter();
    const routerState = useRouterState();
    const path = routerState.location.pathname;
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {cart?.items && cart?.items?.length > 0 && (
                <p className="bg-card text-card-foreground p-2 rounded flex gap-2 mx-4 mt-4" data-testid="urgentMessage-read">
                    <Info />
                    <span className="text-sm">
                        <span className="font-semibold">{`Your items aren’t reserved`}</span>, {`checkout quickly to make sure you don’t miss out.`}
                    </span>
                </p>
            )}
            {cart?.items?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground text-center">Explore our collection and add some items!</p>
                    <Button className="mt-4 rounded-full" onClick={onClose}>
                        Continue Shopping
                    </Button>
                </div>
            ) : (
                <>
                    <ScrollArea className="flex-1 px-6">
                        <div className="space-y-4 py-4">
                            {cart?.items?.map((item, index) => (
                                <div className="p-3 rounded-2xl bg-secondary/50">
                                    <CartItemComponent key={index} item={item} />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    {cart?.items && cart?.items?.length > 0 && (
                        <div className="px-6 pt-4 border-t border-border space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{currency(cart?.subtotal || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium text-primary">{shippingFee === 0 ? "Free" : `${currency(shippingFee || 0)}`}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{currency(cart?.total || 0)}</span>
                            </div>
                            {path !== "/checkout" && (
                                <Button
                                    onClick={() => router.navigate({ to: "/checkout" })}
                                    className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold gap-2 shadow-background/30 shadow-xl"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            )}
                            <button className="w-full text-primary py-2 text-sm hover:underline" onClick={onClose}>
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CartDetails;
