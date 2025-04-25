"use client";

import DiscountCode from "../checkout/components/discount-code";

import { BtnLink } from "@/components/ui/btnLink";
import { Cart } from "@/types/models";
import CartTotals from "@/components/store/cart/cart-totals";

type SummaryProps = {
    cart: Cart;
};

const Summary = ({ cart }: SummaryProps) => {
    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-[2rem] leading-[2.75rem]">Summary</h2>
            <DiscountCode cart={cart} />
            <hr className="tb-divider" />
            <CartTotals data={cart} />
            <BtnLink className="w-full h-10" data-testid="checkout-button" href={"/checkout?step=" + cart.checkout_step}>
                Go to checkout
            </BtnLink>
        </div>
    );
};

export default Summary;
