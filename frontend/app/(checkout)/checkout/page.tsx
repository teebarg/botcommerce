import React from "react";
import { Metadata } from "next";
import CheckoutForm from "@modules/checkout/templates/checkout-form";
import CheckoutSummary from "@modules/checkout/templates/checkout-summary";
import { ArrowRightOnRectangle, Cart, ChevronRight } from "nui-react-icons";

import PaymentButton from "@/modules/checkout/components/payment-button";
import { BackButton } from "@/components/back";
import { siteConfig } from "@/lib/config";
import { BtnLink } from "@/components/ui/btnLink";
import LocalizedClientLink from "@/components/ui/link";
import ThemeButton from "@/lib/theme/theme-button";
import { api } from "@/apis";
import ServerError from "@/components/server-error";
import SignInPrompt from "@/modules/cart/components/sign-in-prompt";
import { auth } from "@/actions/auth";
import ClientOnly from "@/components/client-only";

export const metadata: Metadata = {
    title: `Clothings | ${siteConfig.name} Store | Checkout`,
    description: siteConfig.description,
};

interface EmptyCartProps {}

const EmptyCart: React.FC<EmptyCartProps> = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-content1 p-12 rounded-lg shadow-md text-center max-w-xl">
                <Cart className="w-24 h-24 text-default-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-default-900 mb-2">Your cart is empty</h1>
                <p className="text-default-500 mb-12">{`Looks like you haven't added any items to your cart yet.`}</p>
                <BtnLink color="primary" href="/collections">
                    Continue shopping <ArrowRightOnRectangle className="ml-2 w-4 h-4" />
                </BtnLink>
            </div>
        </div>
    );
};

export default async function Checkout() {
    const { data, error } = await api.cart.get();
    const user = await auth();

    if (error) {
        return <ServerError />;
    }

    if (!data) {
        return <EmptyCart />;
    }

    return (
        <>
            <div className="min-h-screen bg-background">
                {/* Mobile header */}
                <div className="sticky top-0 md:hidden p-4 flex items-center gap-4 bg-background z-20 shadow-2xl">
                    <BackButton />
                    <div>
                        <p className="text-xl">Order confirmation</p>
                        <p className="text-xs text-secondary-500">Free returns within 90days</p>
                    </div>
                </div>
                {/* Header */}
                <header className="flex justify-between items-center px-8 sticky top-0 h-16 bg-background z-10">
                    <LocalizedClientLink className="text-xl font-semibold" href="/">
                        {siteConfig.name}
                    </LocalizedClientLink>
                    <ThemeButton />
                </header>{" "}
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 md:px-8 md:py-8">
                    <div className="flex flex-col md:flex-row md:gap-8">
                        {/* Left Column - Form */}
                        <div className="w-full">
                            <h1 className="text-xl font-light">Checkout your cart</h1>
                            {/* <SignInPrompt /> */}
                            {!user && <SignInPrompt />}
                            <nav aria-label="Breadcrumbs" data-slot="base">
                                <ol className="flex flex-wrap list-none rounded-lg mb-2 mt-4" data-slot="list">
                                    <li className="flex items-center" data-slot="base">
                                        <LocalizedClientLink href={"/"}>Home</LocalizedClientLink>
                                        <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                            <ChevronRight />
                                        </span>
                                    </li>
                                    <li className="flex items-center" data-slot="base">
                                        <LocalizedClientLink href={"/collections"}>Collections</LocalizedClientLink>
                                    </li>
                                </ol>
                            </nav>

                            <ClientOnly>
                                <CheckoutForm cart={data} />
                            </ClientOnly>
                        </div>

                        {/* Right Column Cart summary */}
                        <div className="mb-24 md:mb-0">
                            <CheckoutSummary cart={data} />
                        </div>
                    </div>
                </main>
                {/* Mobile cart summary */}
                <div className="fixed md:hidden bottom-0 z-20 w-full py-5 px-4 bg-content1 shadow-2xl">
                    <div className="flex flex-row-reverse justify-between items-center">
                        <PaymentButton cart={data} data-testid="submit-order-button" isLoggedIn={!!user} />
                    </div>
                </div>
            </div>
        </>
    );
}
