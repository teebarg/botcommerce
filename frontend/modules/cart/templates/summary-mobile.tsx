"use client";

import { Cart } from "types/global";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ChevronDown, XMark } from "nui-react-icons";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { currency } from "@/lib/util/util";
import { cn } from "@/lib/util/cn";

type SummaryProps = {
    cart: Cart;
};

const SummaryMobile = ({ cart }: SummaryProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!cart) return;
    const { subtotal, tax_total, delivery_fee, total, discount_total } = cart;

    const toggleSummary = () => {
        setIsExpanded(!isExpanded);
    };

    const getAmount = (amount: number | null | undefined) => {
        return currency(Number(amount) || 0);
    };

    return (
        <div className={`fixed md:hidden bottom-0 z-50 w-full py-3 flex flex-col gap-2 bg-background shadow-2xl transition-all duration-500`}>
            <div className={`overflow-hidden transition-all duration-500 px-2 ${isExpanded ? "max-h-48" : "max-h-0"}`}>
                <div className="flex items-center justify-between py-2">
                    <p className="text-xl font-medium">Summary</p>
                    <Button className="bg-inherit min-w-0 w-auto px-0" onClick={toggleSummary}>
                        <XMark />
                    </Button>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                    <p>Subtotal</p>
                    <p>{getAmount(subtotal)}</p>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                    <p>Shipping Fee</p>
                    <p>{getAmount(delivery_fee)}</p>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                    <p>Taxes</p>
                    <p>{getAmount(tax_total)}</p>
                </div>
                {!!discount_total && (
                    <div className="flex items-center justify-between text-sm font-medium">
                        <p>Discount</p>
                        <p className="text-rose-500" data-testid="cart-discount" data-value={discount_total || 0}>
                            - {getAmount(discount_total)}
                        </p>
                    </div>
                )}
                <div className="flex items-center justify-between text-lg font-medium mt-2">
                    <p>Total</p>
                    <p>{getAmount(total)}</p>
                </div>
            </div>
            <div className="flex flex-row-reverse gap-2 px-2 py-2">
                <LocalizedClientLink
                    className="relative inline-flex items-center justify-center outline-none px-3 h-10 rounded-small bg-transparent border border-rose-500 text-rose-500"
                    href="/checkout"
                >
                    Checkout ({cart?.items?.length ?? 0})
                </LocalizedClientLink>
                <Button
                    className="bg-inherit"
                    endContent={<ChevronDown className={cn("transition-all duration-500", isExpanded && "rotate-180")} />}
                    onClick={toggleSummary}
                >
                    <span className="text-2xl font-semibold">{getAmount(total ?? 0)}</span>
                </Button>
            </div>
        </div>
    );
};

export default SummaryMobile;
