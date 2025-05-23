"use client";

import Addresses from "@/components/store/checkout/components/addresses";
import Payment from "@/components/store/checkout/components/payment";
import Review from "@/components/store/checkout/components/review";
import Shipping from "@/components/store/checkout/components/shipping";
import { currency } from "@/lib/util/util";
import { Cart, DeliveryOption } from "@/types/models";

type CheckoutFormProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ cart }) => {
    const availableShippingMethods: DeliveryOption[] = [
        {
            id: "STANDARD",
            name: "Standard Delivery",
            description: "Delivery within 3-5 business days.",
            amount: 2500,
            amount_str: currency(2500),
        },
        {
            id: "EXPRESS",
            name: "Express Delivery",
            description: "Delivery within 1-2 business days.",
            amount: 5000,
            amount_str: currency(5000),
        },
        {
            id: "PICKUP",
            name: "Pickup",
            description: "Pickup from the nearest store for free.",
            amount: 0,
            amount_str: "Free",
        },
    ];

    return (
        <div>
            <div className="w-full grid grid-cols-1 gap-y-4">
                <Addresses cart={cart} />
                <Shipping availableShippingMethods={availableShippingMethods} cart={cart} />
                <Payment cart={cart} />
                <Review cart={cart} />
            </div>
        </div>
    );
};

export default CheckoutForm;
