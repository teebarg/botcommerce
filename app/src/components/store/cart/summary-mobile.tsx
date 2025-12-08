import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency, cn } from "@/utils";
import { BtnLink } from "@/components/ui/btnLink";
import type { Cart, CartItem } from "@/schemas";

type SummaryProps = {
    cart: Cart;
};

const SummaryMobile = ({ cart }: SummaryProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!cart) return;
    const { shipping_fee, discount_amount, subtotal, tax, total } = cart;

    const toggleSummary = () => {
        setIsExpanded(!isExpanded);
    };

    const totalItems =
        cart?.items?.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0) || 0;

    return (
        <div className={`sticky md:hidden top-14 z-50 w-full flex flex-col bg-background shadow-2xl transition-all duration-500`}>
            <div className={cn("overflow-hidden transition-all duration-500 px-2", isExpanded ? "max-h-48" : "max-h-0")}>
                <div className="flex items-center justify-between py-2">
                    <p className="text-xl font-medium">Summary</p>
                    <Button aria-label="close" className="bg-inherit min-w-0 w-auto px-0" onClick={toggleSummary}>
                        <X />
                    </Button>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                    <p>Subtotal</p>
                    <p>{currency(subtotal || 0)}</p>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                    <p>Shipping Fee</p>
                    <p>{currency(shipping_fee)}</p>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                    <p>Taxes</p>
                    <p>{currency(tax)}</p>
                </div>
                {!!discount_amount && (
                    <div className="flex items-center justify-between text-sm font-medium">
                        <p>Discount</p>
                        <p className="text-rose-500" data-testid="cart-discount" data-value={discount_amount || 0}>
                            - {currency(discount_amount)}
                        </p>
                    </div>
                )}
                <div className="flex items-center justify-between text-lg font-medium mt-2">
                    <p>Total</p>
                    <p>{currency(total || 0)}</p>
                </div>
            </div>
            <div className="flex flex-row-reverse gap-2 p-2">
                <BtnLink href="/checkout" variant="destructive">
                    Checkout ({totalItems ?? 0})
                </BtnLink>
                <Button
                    className="bg-inherit"
                    endContent={<ChevronDown className={cn("transition-all duration-500 rotate-180", isExpanded && "rotate-0")} />}
                    onClick={toggleSummary}
                >
                    <span className="text-2xl font-semibold">{currency(total || 0)}</span>
                </Button>
            </div>
        </div>
    );
};

export default SummaryMobile;
