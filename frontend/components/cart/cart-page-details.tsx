"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import CartSkeleton from "./cart-skeleton";

import { Cart } from "@/types/models";
import { useCartItem } from "@/lib/hooks/useCart";
import EmptyCartMessage from "@/modules/cart/components/empty-cart-message";
import SignInPrompt from "@/modules/cart/components/sign-in-prompt";
import { useStore } from "@/app/store/use-store";
import { CartItems } from "@/modules/layout/components/cart-items";
import Summary from "@/modules/cart/templates/summary";

interface Props {
    cart: Cart | null;
}

const CartPageDetails: React.FC<Props> = ({ cart }) => {
    const [mounted, setMounted] = useState<boolean>(false);
    const { user } = useStore();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: items, isLoading } = useCartItem();

    if (!mounted) return null;

    if (isLoading) {
        return <CartSkeleton />;
    }

    return (
        <AnimatePresence>
            <motion.div animate={{ y: 0 }} exit={{ y: "100%" }} initial={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}>
                {items?.length === 0 ? (
                    <EmptyCartMessage />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 pt-4">
                        <div className="flex flex-col bg-content1 p-4 gap-y-6 rounded-md">
                            {!user && <SignInPrompt callbackUrl={pathname} />}
                            <CartItems items={items!} />
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
    );
};

export default CartPageDetails;
