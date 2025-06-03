import DiscountCode from "./components/discount-code";

import { Cart } from "@/types/models";
import CartClient from "@/components/store/cart/cart-items";
import CartTotals from "@/components/store/cart/cart-totals";
import { Separator } from "@/components/ui/separator";

interface CheckoutSummaryProps {
    cart: Cart;
}

const CheckoutSummary = ({ cart }: CheckoutSummaryProps) => {
    if (!cart) {
        return null;
    }

    return (
        <div className="relative md:sticky top-16 flex gap-y-8 w-full rounded-xl bg-content1 shadow-md px-2 py-4 md:px-6 md:py-8 lg:w-[400px] lg:flex-none mt-6 sm:mt-0">
            <div className="w-full">
                <h2 className="font-medium text-default-500">Cart Summary</h2>
                <Separator className="my-4" />
                <CartTotals data={cart} />
                <CartClient />
                <div className="my-6">
                    <DiscountCode cart={cart} />
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;
