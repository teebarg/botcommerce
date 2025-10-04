"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import CartItems from "./cart-items";

import EmptyCartMessage from "@/components/store/cart/empty-message";
import Summary from "@/components/store/cart/summary";
import SignInPrompt from "@/components/generic/auth/sign-in-prompt";
import ClientOnly from "@/components/generic/client-only";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";

const CartPageDetails: React.FC = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { cart, isLoading } = useCart();

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    return (
        <ClientOnly>
            <div>
                {cart?.items?.length === 0 ? (
                    <EmptyCartMessage />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 pt-4">
                        <div className="flex flex-col bg-secondary p-4 gap-y-6 rounded-md">
                            {!session && <SignInPrompt callbackUrl={pathname} />}
                            <CartItems />
                        </div>
                        <div className="relative hidden md:block">
                            <div className="flex flex-col gap-y-8 sticky top-12">
                                {cart && (
                                    <div className="bg-secondary px-6 py-0 md:py-6 rounded-md">
                                        <Summary />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientOnly>
    );
};

export default CartPageDetails;
