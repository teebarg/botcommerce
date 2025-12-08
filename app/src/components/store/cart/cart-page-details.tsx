import type React from "react";

import CartItems from "./cart-items";
import EmptyCartMessage from "@/components/store/cart/empty-message";
import Summary from "@/components/store/cart/summary";
import SignInPrompt from "@/components/generic/auth/sign-in-prompt";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";
import { useLocation, useRouteContext } from "@tanstack/react-router";

const CartPageDetails: React.FC = () => {
    const { session } = useRouteContext({ strict: false });
    const location = useLocation();
    const pathname = location.pathname;
    const { cart, isLoading } = useCart();

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    return (
        <div>
            {cart?.items?.length === 0 ? (
                <EmptyCartMessage />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 pt-4">
                    <div className="flex flex-col bg-card p-4 gap-y-6 rounded-md">
                        {!session && <SignInPrompt callbackUrl={pathname} />}
                        <CartItems />
                    </div>
                    <div className="relative hidden md:block">
                        <div className="flex flex-col gap-y-8 sticky top-12">
                            {cart && (
                                <div className="bg-card px-6 py-0 md:py-6 rounded-md">
                                    <Summary />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPageDetails;
