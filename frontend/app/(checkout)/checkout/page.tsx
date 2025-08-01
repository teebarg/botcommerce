"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

import { BackButton } from "@/components/back";
import LocalizedClientLink from "@/components/ui/link";
import ThemeButton from "@/lib/theme/theme-button";
import ServerError from "@/components/generic/server-error";
import { useStore } from "@/app/store/use-store";
import EmptyCartMessage from "@/components/store/cart/empty-message";
import { CartComponent } from "@/components/store/cart/cart-component";
import CheckoutSummary from "@/components/store/checkout/checkout-summary";
import { useCart } from "@/providers/cart-provider";
import CheckoutFlow from "@/components/store/checkout/components/checkout-flow";
import ComponentLoader from "@/components/component-loader";

export default function Checkout() {
    const { shopSettings } = useStore();

    const { cart, error, isLoading } = useCart();

    if (error) {
        return <ServerError error={error.message} scenario="checkout" stack={error.stack} />;
    }

    if (!cart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <EmptyCartMessage />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 md:hidden p-4 flex items-center justify-between gap-4 bg-background z-20 shadow-2xl pr-8">
                <div className="flex items-center gap-2">
                    <BackButton />
                    <div>
                        <p className="text-xl">Order confirmation</p>
                        <p className="text-xs text-secondary-500">Free returns within 90days</p>
                    </div>
                </div>
                <CartComponent />
            </div>
            <header className="hidden md:flex justify-between items-center px-8 sticky top-0 h-16 bg-background z-10">
                <LocalizedClientLink className="text-xl font-semibold" href="/">
                    {shopSettings.shop_name}
                </LocalizedClientLink>
                <ThemeButton />
            </header>{" "}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-x-8 px-2 pt-4">
                    <ComponentLoader className="rounded-md h-192 md:mt-8" />
                    <div className="relative hidden md:block">
                        <ComponentLoader className="h-192 w-full rounded-md" />
                    </div>
                </div>
            ) : (
                <main className="max-w-8xl mx-auto px-4 md:px-8 md:pt-4 pb-8">
                    <div className="flex flex-col md:flex-row md:gap-8">
                        <div className="w-full">
                            <nav aria-label="Breadcrumbs" data-slot="base">
                                <ol className="flex flex-wrap list-none rounded-lg mb-2 mt-4 md:mt-0" data-slot="list">
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
                            <CheckoutFlow cart={cart} />
                        </div>

                        <div className="mb-24 md:mb-0 hidden md:block">
                            <CheckoutSummary />
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
