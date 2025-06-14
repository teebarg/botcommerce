"use client";

import DiscountCode from "../checkout/components/discount-code";

import { BtnLink } from "@/components/ui/btnLink";
import { Cart } from "@/schemas";
import CartTotals from "@/components/store/cart/cart-totals";
import { Separator } from "@/components/ui/separator";

type SummaryProps = {
    cart: Cart;
};

const Summary = ({ cart }: SummaryProps) => {
    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-[2rem] leading-11">Summary</h2>
            <DiscountCode cart={cart} />
            <Separator className="my-2" />
            <CartTotals data={cart} />
            <BtnLink className="w-full h-10" data-testid="checkout-button" href={"/checkout?step=" + cart.checkout_step}>
                Go to checkout
            </BtnLink>
        </div>
    );
};

export default Summary;
