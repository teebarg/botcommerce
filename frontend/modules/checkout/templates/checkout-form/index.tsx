import { getCustomer } from "@lib/data";
import Addresses from "@modules/checkout/components/addresses";
import Payment from "@modules/checkout/components/payment";
import Review from "@modules/checkout/components/review";
import Shipping from "@modules/checkout/components/shipping";
import { cookies } from "next/headers";
import { Cart } from "types/global";

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
        { id: 1, name: "Express", amount: 5000 },
        { id: 2, name: "Regular", amount: 2500 },
    ];

    // get customer if logged in
    const customer = await getCustomer();

    return (
        <div>
            <div className="w-full grid grid-cols-1 gap-y-8">
                <div>
                    <Addresses cart={cart} customer={customer} />
                </div>

                <div>
                    <Shipping availableShippingMethods={availableShippingMethods} cart={cart} />
                </div>

                <div>
                    <Payment cart={cart} />
                </div>

                <div className="hidden md:block">
                    <Review cart={cart} customer={customer} />
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;
