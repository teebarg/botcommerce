"use client";

import { Cart as CartIcon } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";
import React, { useEffect, useRef, useState } from "react";
import { SlideOver } from "@modules/common/components/slideover";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Cart, CartItem } from "types/global";
import { usePathname } from "next/navigation";
import { currency } from "@lib/util/util";
import { Chip } from "@modules/common/components/chip";

import { CartItems } from "../cart-items";

interface ComponentProps {
    cart: Omit<Cart, "beforeInsert" | "afterLoad"> | null;
}

const CartComponent: React.FC<ComponentProps> = ({ cart }) => {
    const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(undefined);

    const totalItems =
        cart?.items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0) || 0;

    const total =
        cart?.items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity * item.price;
        }, 0) || 0;

    const state = useOverlayTriggerState({});
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
        <div className="hidden md:block">
            <div className="flex items-center">
                <button aria-label="cart" className="h-full w-full flex items-center justify-center text-default-500" onClick={state.open}>
                    <CartIcon className="h-8 w-8" />
                </button>
                <div className="hidden md:flex flex-col items-center justify-center">
                    <Chip size="sm" title={totalItems.toString()} />
                    <p className="font-semibold text-sm mt-0">Cart</p>
                </div>
            </div>
            {state.isOpen && (
                <SlideOver
                    className="bg-default-100"
                    footer={
                        <React.Fragment>
                            <div className="p-2">
                                <dl className="flex flex-col gap-4 py-4">
                                    <div className="flex justify-between">
                                        <dt className="text-small text-default-500">Subtotal</dt>
                                        <dd className="text-small font-semibold text-default-900">{currency(total)}</dd>
                                    </div>
                                </dl>
                                {cart?.items?.length && (
                                    <div className="mt-4">
                                        <LocalizedClientLink
                                            className="inline-flex items-center justify-center whitespace-nowrap font-normal overflow-hidden px-4 min-w-20 h-10 text-small gap-2 rounded-medium bg-primary text-primary-foreground w-full"
                                            href={"/checkout"}
                                        >
                                            Checkout
                                        </LocalizedClientLink>
                                    </div>
                                )}
                                <div className="mt-6 flex items-center justify-center text-center text-sm">
                                    <LocalizedClientLink className="font-medium" href={"/collections"}>
                                        Continue Shopping
                                        <span aria-hidden="true"> →</span>
                                    </LocalizedClientLink>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                    isOpen={state.isOpen}
                    title="Carts"
                    onClose={closeSlideOver}
                >
                    <CartItems cartItems={cart?.items} />
                </SlideOver>
            )}
        </div>
    );
};

export { CartComponent };
