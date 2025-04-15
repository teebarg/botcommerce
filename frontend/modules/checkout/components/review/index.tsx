"use client";

import { useSearchParams } from "next/navigation";

import PaymentButton from "../payment-button";

import { cn } from "@/lib/util/cn";
import { Cart } from "@/types/models";
import { useStore } from "@/app/store/use-store";

const Review = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> }) => {
    const searchParams = useSearchParams();
    const { shopSettings } = useStore();

    const isOpen = searchParams.get("step") === "review";

    // const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const previousStepsCompleted = cart?.shipping_address_id && cart?.shipping_method && cart?.payment_method;

    if (!previousStepsCompleted || !isOpen) {
        return null;
    }

    return (
        <div>
            <h2
                className={cn("text-xl", {
                    "opacity-50": !isOpen,
                })}
            >
                Review
            </h2>
            <div className="w-full mt-1 mb-4">
                <p className="font-medium text-sm mb-1 text-default-600">
                    By clicking the Place Order button, you confirm that you have read, understand and accept our Terms of Use, Terms of Sale and
                    Returns Policy and acknowledge that you have read {shopSettings.shop_name}&apos;s Privacy Policy.
                </p>
            </div>
            <PaymentButton cart={cart} data-testid="submit-order-button" isLoggedIn={true} />
        </div>
    );
};

export default Review;
