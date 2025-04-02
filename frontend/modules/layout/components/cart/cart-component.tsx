"use client";

import { ShoppingCart } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Cart, CartItem } from "@/types/models";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import CartDetails from "@/components/cart/cart-details";
import { Button } from "@/components/ui/button";

interface ComponentProps {
    cart: Omit<Cart, "beforeInsert" | "afterLoad"> | null;
}

const CartComponent: React.FC<ComponentProps> = ({ cart }) => {
    const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(undefined);

    const totalItems =
        cart?.items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0) || 0;

    const state = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const closeSlideOver = () => {
        if (activeTimer) {
            clearTimeout(activeTimer as unknown as number);
        }
        state.close();
    };

    const itemRef = useRef<number>(totalItems || 0);

    const timedOpen = () => {
        state.open();

        const timer = setTimeout(closeSlideOver, 60000);

        setActiveTimer(timer);
    };

    // Clean up the timer when the component unmounts
    useEffect(() => {
        return () => {
            if (activeTimer) {
                clearTimeout(activeTimer as unknown as number);
            }
        };
    }, [activeTimer]);

    const pathname = usePathname();

    // open cart dropdown when modifying the cart items, but only if we're not on the cart page
    useEffect(() => {
        if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
            timedOpen();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalItems, itemRef.current]);

    return (
        <Drawer open={editState.isOpen} onOpenChange={editState.setOpen}>
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
                <CartDetails cart={cart} items={cart?.items || []} shippingFee={cart?.shipping_fee} onClose={editState.close} />
            </DrawerContent>
        </Drawer>
    );
};

export { CartComponent };
