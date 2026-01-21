import type React from "react";
import { currency } from "@/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";

const CartTotals: React.FC = () => {
    const { cart, isLoading } = useCart();

    if (isLoading) return <ComponentLoader className="h-[100px]" />;

    if (!cart) return null;

    const { discount_amount, tax, total, subtotal } = cart;

    return (
        <>
            <div>
                <dl className="flex flex-col gap-2 py-4">
                    <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                            <span className="flex gap-x-1 items-center">
                                Subtotal
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Cart total excluding shipping and taxes.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </dt>
                        <dd className="text-sm font-semibold">
                            <span data-testid="cart-subtotal" data-value={subtotal || 0}>
                                {currency(subtotal || 0)}
                            </span>
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Delivery</dt>
                        <dd className="text-sm font-semibold">
                            <span data-testid="cart-shipping" data-value={cart.shipping_fee || 0}>
                                {currency(cart.shipping_fee)}
                            </span>
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Taxes</dt>
                        <dd className="text-sm font-semibold">
                            <span data-testid="cart-taxes" data-value={tax || 0}>
                                {currency(tax)}
                            </span>
                        </dd>
                    </div>
                    {!!discount_amount && (
                        <div className="flex justify-between">
                            <dt className="text-sm text-muted-foreground">Discount</dt>
                            <dd className="text-sm font-semibold">
                                <span className="text-emerald-600" data-testid="cart-discount" data-value={discount_amount || 0}>
                                    - {currency(discount_amount)}
                                </span>
                            </dd>
                        </div>
                    )}

                    <Separator className="my-2" />
                    <div className="flex justify-between">
                        <dt className="text-sm font-semibold text-muted-foreground">Total</dt>
                        <dd className="text-sm font-semibold">
                            <span className="text-lg" data-testid="cart-total" data-value={total}>
                                {currency(total)}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
        </>
    );
};

export default CartTotals;
