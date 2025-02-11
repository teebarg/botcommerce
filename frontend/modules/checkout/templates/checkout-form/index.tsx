import { getCustomer } from "@lib/data";
import Addresses from "@modules/checkout/components/addresses";
import Payment from "@modules/checkout/components/payment";
import Review from "@modules/checkout/components/review";
import Shipping from "@modules/checkout/components/shipping";
import { cookies } from "next/headers";
import { Cart } from "types/global";

import { currency } from "@/lib/util/util";

type CheckoutFormProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
};

const CheckoutForm: React.FC<CheckoutFormProps> = async ({ cart }) => {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return null;
    }

    // cart.checkout_step = cart && getCheckoutStep(cart);

    const availableShippingMethods: any = [
        {
            id: 1,
            name: "Standard Delivery",
            description: "Delivery within 3-5 business days.",
            amount: currency(2500),
        },
        {
            id: 2,
            name: "Express Delivery",
            description: "Delivery within 1-2 business days.",
            amount: currency(5000),
        },
        {
            id: 3,
            name: "Free Pickup",
            description: "Pickup from the nearest store for free.",
            amount: "Free",
        },
    ];

    // get customer if logged in
    const customer = await getCustomer();

    return (
        <div>
            <div className="w-full grid grid-cols-1 gap-y-4">
                <Addresses cart={cart} customer={customer} />
                <Shipping availableShippingMethods={availableShippingMethods} cart={cart} />
                <Payment cart={cart} />
                <div className="hidden md:block">
                    <Review cart={cart} customer={customer} />
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;
