import { Metadata } from "next";
import { getCustomer } from "@lib/data";
import { retrieveCart } from "@modules/cart/actions";
import SignInPrompt from "@modules/cart/components/sign-in-prompt";
import ItemsTemplate from "@modules/cart/templates/items";
import Summary from "@modules/cart/templates/summary";
import EmptyCartMessage from "@modules/cart/components/empty-cart-message";

export const metadata: Metadata = {
    title: "Cart | TBO Store",
    description: "View your cart",
};

export default async function Cart() {
    const cart = await retrieveCart();
    const customer = await getCustomer();

    return (
        <div className="py-0 md:py-12">
            <div className="max-w-7xl mx-auto" data-testid="cart-container">
                {cart?.items.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8">
                        <div className="flex flex-col bg-content1 p-6 gap-y-6 rounded-md">
                            {!customer && (
                                <>
                                    <SignInPrompt />
                                    <hr className="tb-divider" />
                                </>
                            )}
                            <ItemsTemplate items={cart?.items} />
                        </div>
                        <div className="relative">
                            <div className="flex flex-col gap-y-8 sticky top-12">
                                {cart && (
                                    <>
                                        <div className="bg-content1 px-6 py-0 md:py-6 rounded-md">
                                            <Summary cart={cart} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <EmptyCartMessage />
                    </div>
                )}
            </div>
        </div>
    );
}
