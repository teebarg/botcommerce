"use client";

import DiscountCode from "@/components/store/checkout/components/discount-code";

import { BtnLink } from "@/components/ui/btnLink";
import CartTotals from "@/components/store/cart/cart-totals";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/cart-provider";

const Summary = () => {
    const { cart } = useCart();

    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-[2rem] leading-11">Summary</h2>
            <DiscountCode />
            <Separator className="my-2" />
            <CartTotals />
            <BtnLink className="w-full h-10" data-testid="checkout-button" href={"/checkout?step=" + cart?.checkout_step}>
                Go to checkout
            </BtnLink>
        </div>
    );
};

export default Summary;
