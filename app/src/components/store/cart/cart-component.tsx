import { useOverlayTriggerState } from "react-stately";
import React from "react";

import { CartItem } from "@/schemas";
import CartDetails from "@/components/store/cart/cart-details";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useCart } from "@/providers/cart-provider";
import { ShoppingCart } from "lucide-react";

const CartComponent: React.FC = () => {
    const { cart } = useCart();

    const totalItems =
        cart?.items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0) || 0;

    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            sheetClassName="min-w-[450px]"
            title="Cart"
            trigger={
                <Button size="icon" variant="ghost">
                    <ShoppingCart className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {totalItems.toString()}
                    </span>
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <CartDetails cart={cart!} shippingFee={cart?.shipping_fee} onClose={state.close} />
        </Overlay>
    );
};

export { CartComponent };
