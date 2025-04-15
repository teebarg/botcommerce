"use client";

import React from "react";
import CheckoutForm from "@modules/checkout/templates/checkout-form";
import CheckoutSummary from "@modules/checkout/templates/checkout-summary";
import { ChevronRight } from "nui-react-icons";

import PaymentButton from "@/modules/checkout/components/payment-button";
import { BackButton } from "@/components/back";
import LocalizedClientLink from "@/components/ui/link";
import ThemeButton from "@/lib/theme/theme-button";
import ServerError from "@/components/server-error";
import ClientOnly from "@/components/client-only";
import { useCart } from "@/lib/hooks/useCart";
import { useStore } from "@/app/store/use-store";
import EmptyCartMessage from "@/modules/cart/components/empty-cart-message";
import CheckoutSkeleton from "@/components/checkout/checkout-skeleton";

export default function Checkout() {
    const { user } = useStore();
    const { shopSettings } = useStore();

    const { data, error, isLoading } = useCart();

    if (isLoading) {
        return <CheckoutSkeleton />;
    }

    if (error) {
        return <ServerError />;
    }

    if (!data || !data.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <EmptyCartMessage />
            </div>
        );
    }

    const cart = data?.data;

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
                <header className="hidden md:flex justify-between items-center px-8 sticky top-0 h-16 bg-background z-10">
                    <LocalizedClientLink className="text-xl font-semibold" href="/">
                        {shopSettings.shop_name}
                    </LocalizedClientLink>
                    <ThemeButton />
                </header>{" "}
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 md:px-8 md:py-8">
                    <div className="flex flex-col md:flex-row md:gap-8">
                        {/* Left Column - Form */}
                        <div className="w-full">
                            <h1 className="text-xl font-light">Checkout your cart</h1>
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
                                <CheckoutForm cart={cart} />
                            </ClientOnly>
                        </div>

                        {/* Right Column Cart summary */}
                        <div className="mb-24 md:mb-0">
                            <CheckoutSummary cart={cart} />
                        </div>
                    </div>
                </main>
                {/* Mobile cart summary */}
                <div className="fixed md:hidden bottom-0 z-20 w-full py-5 px-4 bg-content1 shadow-2xl">
                    <div className="flex flex-row-reverse justify-between items-center">
                        <PaymentButton cart={cart} data-testid="submit-order-button" isLoggedIn={!!user} />
                    </div>
                </div>
            </div>
        </>
    );
}
