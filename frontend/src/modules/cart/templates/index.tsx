import { Cart, Customer } from "types/global";

import SignInPrompt from "../components/sign-in-prompt";
import EmptyCartMessage from "../components/empty-cart-message";

import Summary from "./summary";
import ItemsTemplate from "./items";

const CartTemplate = ({ cart, customer }: { cart: Cart; customer: Customer }) => {
    return (
        <div className="py-12">
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
                                        <div className="bg-content1 p-6 rounded-md">
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
};

export default CartTemplate;
