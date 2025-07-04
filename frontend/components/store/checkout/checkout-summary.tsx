import DiscountCode from "./components/discount-code";

import CartTotals from "@/components/store/cart/cart-totals";
import { Separator } from "@/components/ui/separator";
import CartItems from "@/components/store/cart/cart-items";

const CheckoutSummary = () => {
    return (
        <div className="relative md:sticky top-16 flex gap-y-8 w-full rounded-xl bg-content1 shadow-md px-2 py-4 md:px-6 md:py-8 lg:w-[400px] lg:flex-none mt-6 sm:mt-0">
            <div className="w-full">
                <h2 className="font-medium text-default-500">Cart Summary</h2>
                <Separator className="my-4" />
                <CartTotals />
                <CartItems className="max-h-[40vh] overflow-y-auto" />
                <div className="my-6">
                    <DiscountCode />
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;
