"use client";

import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { siteConfig } from "@lib/config";

import PaymentButton from "../payment-button";

const Review = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> }) => {
    const searchParams = useSearchParams();

    const isOpen = searchParams.get("step") === "review";

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const previousStepsCompleted = cart.shipping_address && cart.shipping_methods.length > 0 && (cart.payment_session || paidByGiftcard);

    return (
        <div>
            <div className="flex flex-row items-center justify-between mb-6">
                <h2
                    className={clsx("flex flex-row text-3xl-regular gap-x-2 items-baseline", {
                        "opacity-50 pointer-events-none select-none": !isOpen,
                    })}
                >
                    Review
                </h2>
            </div>
            {isOpen && previousStepsCompleted && (
                <>
                    <div className="flex items-start gap-x-1 w-full mb-6">
                        <div className="w-full">
                            <p className="font-medium text-sm mb-1">
                                By clicking the Place Order button, you confirm that you have read, understand and accept our Terms of Use, Terms of
                                Sale and Returns Policy and acknowledge that you have read {siteConfig.name}&apos;s Privacy Policy.
                            </p>
                        </div>
                    </div>
                    <PaymentButton cart={cart} data-testid="submit-order-button" />
                </>
            )}
        </div>
    );
};

export default Review;
