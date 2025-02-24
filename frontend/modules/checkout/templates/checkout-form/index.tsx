import Addresses from "@modules/checkout/components/addresses";
import Payment from "@modules/checkout/components/payment";
import Review from "@modules/checkout/components/review";
import Shipping from "@modules/checkout/components/shipping";
import { cookies } from "next/headers";

import { currency } from "@/lib/util/util";
import { api } from "@/api";
import { Cart } from "@/lib/models";

type CheckoutFormProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
};

const CheckoutForm: React.FC<CheckoutFormProps> = async ({ cart }) => {
    const cookieStore = await cookies();
    const cartId = cookieStore.get("_cart_id")?.value;

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
    const customer = await api.user.me();

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
