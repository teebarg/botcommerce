import Addresses from "@modules/checkout/components/addresses";
import Payment from "@modules/checkout/components/payment";
import Review from "@modules/checkout/components/review";
import Shipping from "@modules/checkout/components/shipping";

import { currency } from "@/lib/util/util";
import { Cart, DeliveryOption } from "@/types/models";
import { getCookie } from "@/lib/util/server-utils";
import { api } from "@/apis";

type CheckoutFormProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
};

const CheckoutForm: React.FC<CheckoutFormProps> = async ({ cart }) => {
    const cartId = await getCookie("_cart_id");

    if (!cartId) {
        return null;
    }

    // cart.checkout_step = cart && getCheckoutStep(cart);

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
            name: "Free Pickup",
            description: "Pickup from the nearest store for free.",
            amount: 0,
            amount_str: "Free",
        },
    ];

    // get customer if logged in
    const { data: customer } = await api.user.me();

    return (
        <div>
            <div className="w-full grid grid-cols-1 gap-y-4">
                <Addresses cart={cart} user={customer} />
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
