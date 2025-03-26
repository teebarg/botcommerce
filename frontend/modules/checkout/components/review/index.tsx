"use client";

import { useSearchParams } from "next/navigation";
import { siteConfig } from "@lib/config";

import PaymentButton from "../payment-button";

import { cn } from "@/lib/util/cn";
import { Cart, Session } from "@/types/models";

const Review = ({ cart, customer }: { cart: Omit<Cart, "refundable_amount" | "refunded_total">; customer: Session | null }) => {
    const searchParams = useSearchParams();

    const isOpen = searchParams.get("step") === "review";

    // const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const previousStepsCompleted = cart?.shipping_address && cart?.shipping_method && cart?.payment_method;

    return (
        <div>
            <h2
                className={cn("text-xl", {
                    "opacity-50": !isOpen,
                })}
            >
                Review
            </h2>
            {isOpen && previousStepsCompleted && (
                <>
                    <div className="w-full mt-1 mb-4">
                        <p className="font-medium text-sm mb-1">
                            By clicking the Place Order button, you confirm that you have read, understand and accept our Terms of Use, Terms of Sale
                            and Returns Policy and acknowledge that you have read {siteConfig.name}&apos;s Privacy Policy.
                        </p>
                    </div>
                    <PaymentButton cart={cart} data-testid="submit-order-button" user={customer} />
                </>
            )}
        </div>
    );
};

export default Review;
