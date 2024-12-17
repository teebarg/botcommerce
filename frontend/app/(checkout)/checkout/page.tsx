import React from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Wrapper from "@modules/checkout/components/payment-wrapper";
import CheckoutForm from "@modules/checkout/templates/checkout-form";
import CheckoutSummary from "@modules/checkout/templates/checkout-summary";
import { getCart, getCustomer } from "@lib/data";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ArrowRightOnRectangle, Cart, ChevronRight } from "nui-react-icons";
import PaymentButton from "@/modules/checkout/components/payment-button";
import { BackButton } from "@/components/back";

export const metadata: Metadata = {
    title: "Clothings | Botcommerce Store | Checkout",
};

interface EmptyCartProps {}

const EmptyCart: React.FC<EmptyCartProps> = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-content1 p-12 rounded-lg shadow-md text-center max-w-xl">
                <Cart className="w-24 h-24 text-default-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-default-900 mb-2">Your cart is empty</h2>
                <p className="text-default-500 mb-6">{`Looks like you haven't added any items to your cart yet.`}</p>
                <LocalizedClientLink
                    className="inline-flex items-center bg-primary text-white font-semibold py-3 px-6 rounded-md mt-6 transition-colors"
                    href="/collections"
                >
                    Continue shopping <ArrowRightOnRectangle className="ml-2 w-4 h-4" />
                </LocalizedClientLink>
            </div>
        </div>
    );
};

const fetchCart = async () => {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return null;
    }

    const cart = await getCart(cartId).then((cart) => cart);

    return cart;
};

export default async function Checkout() {
    const cart = await fetchCart();

    if (!cart) {
        return <EmptyCart />;
    }

    const customer = await getCustomer();

    return (
        <>
            {" "}
            <div className="relative flex min-h-dvh flex-col bg-background bg-radial pt-0 md:pt-4 sm:pt-16" id="app-container">
                <div className="sticky top-0 md:hidden p-4 flex items-center gap-4 bg-background z-20 shadow-2xl">
                    <BackButton />
                    <div>
                        <p className="text-xl">Order confirmation</p>
                        <p className="text-xs text-secondary-500">Free returns within 90days</p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-4">
                    <section className="flex w-full max-w-7xl flex-col lg:flex-row lg:gap-8">
                        <div className="w-full">
                            <div className="hidden md:flex flex-col gap-1 mb-6">
                                <h1 className="text-2xl font-medium">Shopping Cart</h1>
                                <nav aria-label="Breadcrumbs" data-slot="base">
                                    <ol className="flex flex-wrap list-none rounded-small" data-slot="list">
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
                            </div>
                            <Wrapper cart={cart}>
                                <CheckoutForm cart={cart} />
                            </Wrapper>
                        </div>
                        <CheckoutSummary />
                    </section>
                </div>
                <div className={`fixed md:hidden bottom-0 z-50 w-full py-3 flex flex-col gap-2 bg-background shadow-2xl transition-all duration-500`}>
                    <div className="flex flex-row-reverse gap-2 px-2 py-2">
                        <PaymentButton cart={cart} customer={customer} data-testid="submit-order-button" />
                    </div>
                </div>
            </div>
        </>
    );
}
