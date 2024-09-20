import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Wrapper from "@modules/checkout/components/payment-wrapper";
import CheckoutForm from "@modules/checkout/templates/checkout-form";
import CheckoutSummary from "@modules/checkout/templates/checkout-summary";
import { getCart } from "@lib/data";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ChevronRightIcon } from "nui-react-icons";

export const metadata: Metadata = {
    title: "Clothings | TBO Store | Checkout",
};

const fetchCart = async () => {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return notFound();
    }

    const cart = await getCart(cartId).then((cart) => cart);
    return cart;
};

export default async function Checkout() {
    const cart = await fetchCart();

    if (!cart) {
        return notFound();
    }

    return (
        <>
            {" "}
            <div className="relative flex min-h-dvh flex-col bg-background bg-radial pt-16" id="app-container">
                <div className="flex items-center justify-center p-4">
                    <section className="flex w-full max-w-7xl flex-col lg:flex-row lg:gap-8">
                        <div className="w-full">
                            <div className="flex flex-col gap-1 mb-6">
                                <h1 className="text-2xl font-medium">Shopping Cart</h1>
                                <nav aria-label="Breadcrumbs" data-slot="base">
                                    <ol className="flex flex-wrap list-none rounded-small" data-slot="list">
                                        <li className="flex items-center" data-slot="base">
                                            <LocalizedClientLink href={"/"}>Home</LocalizedClientLink>
                                            <span aria-hidden="true" className="px-1 text-foreground/50" data-slot="separator">
                                                <ChevronRightIcon />
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
            </div>
        </>
    );
}
