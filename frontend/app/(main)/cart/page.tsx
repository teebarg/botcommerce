import { Metadata } from "next";
import { getCustomer } from "@lib/data";
import { Shield } from "nui-react-icons";
import { retrieveCart } from "@modules/cart/actions";
import SignInPrompt from "@modules/cart/components/sign-in-prompt";
import Summary from "@modules/cart/templates/summary";
import EmptyCartMessage from "@modules/cart/components/empty-cart-message";

import SummaryMobile from "@/modules/cart/templates/summary-mobile";
import RecommendedProducts from "@/modules/products/components/recommended";
import { CartItem } from "@/types/global";
import { siteConfig } from "@/lib/config";
import Items from "@/components/order/cart-details";

export const metadata: Metadata = {
    title: `Cart | ${process.env.NEXT_PUBLIC_NAME} Store`,
    description: siteConfig.description,
};

export default async function Cart() {
    const cart = await retrieveCart();
    const customer = await getCustomer();

    const product_ids = cart?.items?.map((x: CartItem) => x.product_id);

    return (
        <>
            <div className="py-0 md:py-12">
                <div className="max-w-7xl mx-auto" data-testid="cart-container">
                    {cart?.items.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8">
                            <div className="flex flex-col bg-content1 px-4 py-6 gap-y-6 rounded-md">
                                {!customer && (
                                    <>
                                        <SignInPrompt />
                                        <hr className="tb-divider" />
                                    </>
                                )}
                                <div className="pb-1 flex items-center">
                                    <h3 className="text-2xl">Cart</h3>
                                </div>
                                <Items isOrder={false} items={cart?.items} />
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
                    ) : (
                        <div>
                            <EmptyCartMessage />
                        </div>
                    )}
                    <div className="px-2 py-4 mt-4">
                        <div className="flex gap-2 items-center">
                            <Shield />
                            <p>Security & Privacy</p>
                        </div>
                        <div className="flex gap-4 text-default-500 text-sm">
                            <p>Safe payments</p>
                            <p>Secure personal details</p>
                        </div>
                    </div>
                    <div className="px-2 mt-4">
                        <p className="text:sm md:text-lg font-semibold">More to love</p>
                        <RecommendedProducts exclude={product_ids} />
                    </div>
                </div>
            </div>
            <SummaryMobile cart={cart} />
        </>
    );
}
