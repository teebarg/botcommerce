"use client";

import { ShoppingCart } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";
import React from "react";

import { CartItem } from "@/types/models";
import CartDetails from "@/components/store/cart/cart-details";
import { Button } from "@/components/ui/button";
import { useCart, useCartItem } from "@/lib/hooks/useCart";
import Overlay from "@/components/overlay";

const CartComponent: React.FC = () => {
    const { data: items } = useCartItem();
    const { data: cart } = useCart();

    const totalItems =
        items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0) || 0;

    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            title="Cart"
            trigger={
                <Button size="iconOnly">
                    <ShoppingCart className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {totalItems.toString()}
                    </span>
                </Button>
            }
            onOpenChange={state.setOpen}
            sheetClassName="min-w-[450px]"
        >
            <CartDetails cart={cart!} items={items ?? []} shippingFee={cart?.shipping_fee} onClose={state.close} />
        </Overlay>
    );
};

export { CartComponent };
