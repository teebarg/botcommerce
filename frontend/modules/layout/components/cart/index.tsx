"use client";

import { ShoppingCart } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";
import React from "react";

import { CartItem } from "@/types/models";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import CartDetails from "@/components/cart/cart-details";
import { Button } from "@/components/ui/button";
import { useCart, useCartItem } from "@/lib/hooks/useCart";

const CartComponent: React.FC = () => {
    const { data: items } = useCartItem();
    const { data: cart } = useCart();

    const totalItems =
        items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0) || 0;

    const state = useOverlayTriggerState({});

    return (
        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
            <DrawerTrigger asChild>
                <Button className="w-7 h-7" size="icon" variant="ghost">
                    <ShoppingCart className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {totalItems.toString()}
                    </span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="sr-only">Cart</DrawerTitle>
                </DrawerHeader>
                <CartDetails cart={cart!} items={items ?? []} shippingFee={cart?.shipping_fee} onClose={state.close} />
            </DrawerContent>
        </Drawer>
    );
};

export { CartComponent };
