"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import CartItems from "./cart-items";

import EmptyCartMessage from "@/components/store/cart/empty-message";
import { Cart } from "@/schemas";
import { useStore } from "@/app/store/use-store";
import Summary from "@/components/store/cart/summary";
import SignInPrompt from "@/components/generic/auth/sign-in-prompt";
import ClientOnly from "@/components/generic/client-only";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";

interface Props {
    cart: Cart | null;
}

const CartPageDetails: React.FC<Props> = ({ cart }) => {
    const { user } = useStore();
    const pathname = usePathname();
    const { cartItems, isLoading } = useCart();

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    return (
        <ClientOnly>
            <AnimatePresence>
                <motion.div
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    initial={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {cartItems?.length === 0 ? (
                        <EmptyCartMessage />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 pt-4">
                            <div className="flex flex-col bg-content1 p-4 gap-y-6 rounded-md">
                                {!user && <SignInPrompt callbackUrl={pathname} />}
                                <CartItems />
                            </div>
                            <div className="relative hidden md:block">
                                <div className="flex flex-col gap-y-8 sticky top-12">
                                    {cart && (
                                        <div className="bg-content1 px-6 py-0 md:py-6 rounded-md">
                                            <Summary cart={cart} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </ClientOnly>
    );
};

export default CartPageDetails;
