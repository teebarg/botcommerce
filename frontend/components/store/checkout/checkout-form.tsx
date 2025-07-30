"use client";

import ClientOnly from "@/components/generic/client-only";
import Addresses from "@/components/store/checkout/components/addresses";
import Payment from "@/components/store/checkout/components/payment";
import Review from "@/components/store/checkout/components/review";
import Shipping from "@/components/store/checkout/components/shipping";
import { Cart } from "@/schemas";

type CheckoutFormProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ cart }) => {
    return (
        <ClientOnly>
            <div className="w-full grid grid-cols-1 gap-y-4">
                <Addresses cart={cart} />
                <Shipping cart={cart} />
                <Payment cart={cart} />
                <Review cart={cart} />
            </div>
        </ClientOnly>
    );
};

export default CheckoutForm;
