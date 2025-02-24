import ItemsPreviewTemplate from "@modules/cart/templates/preview";
import DiscountCode from "@modules/checkout/components/discount-code";
import CartTotals from "@modules/common/components/cart-totals";

import { api } from "@/api";
import ServerError from "@/components/server-error";

const CheckoutSummary = async () => {
    const cart = await api.cart.get();

    if ("error" in cart) {
        return <ServerError />;
    }

    if (!cart) {
        return null;
    }

    return (
        <div className="relative md:sticky top-0 flex gap-y-8 w-full rounded-xl bg-content1 shadow-medium px-2 py-4 md:px-6 md:py-8 lg:w-[400px] lg:flex-none mt-6 sm:mt-0">
            <div className="w-full">
                <h2 className="font-medium text-default-500">Cart Summary</h2>
                <hr className="tb-divider mt-4" />
                <CartTotals data={cart} />
                <ItemsPreviewTemplate items={cart?.items} />
                <div className="my-6">
                    <DiscountCode cart={cart} />
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;
