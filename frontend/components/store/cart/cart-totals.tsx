"use client";

import { InformationCircleSolid } from "nui-react-icons";
import React from "react";
import { currency } from "@lib/utils";
import { Tooltip } from "@components/ui/tooltip";

import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";

const CartTotals: React.FC = () => {
    const { cart, isLoading } = useCart();
    if (isLoading) return <ComponentLoader className="h-[100px]" />;

    if (!cart) return null;

    const { discount_total, tax, total, subtotal } = cart;

    return (
        <>
            <div>
                <dl className="flex flex-col gap-2 py-4">
                    <div className="flex justify-between">
                        <dt className="text-sm text-default-500">
                            <span className="flex gap-x-1 items-center">
                                Subtotal
                                <Tooltip content="Cart total excluding shipping and taxes." position="right">
                                    <span>
                                        <InformationCircleSolid />
                                    </span>
                                </Tooltip>
                            </span>
                        </dt>
                        <dd className="text-sm font-semibold text-default-900">
                            <span data-testid="cart-subtotal" data-value={subtotal || 0}>
                                {currency(subtotal || 0)}
                            </span>
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-sm text-default-500">Delivery</dt>
                        <dd className="text-sm font-semibold text-default-900">
                            <span data-testid="cart-shipping" data-value={cart.shipping_fee || 0}>
                                {currency(cart.shipping_fee)}
                            </span>
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-sm text-default-500">Taxes</dt>
                        <dd className="text-sm font-semibold text-default-900">
                            <span data-testid="cart-taxes" data-value={tax || 0}>
                                {currency(tax)}
                            </span>
                        </dd>
                    </div>
                    {!!discount_total && (
                        <div className="flex justify-between">
                            <dt className="text-sm text-default-500">Discount</dt>
                            <dd className="text-sm font-semibold text-success">
                                <span className="text-blue-500" data-testid="cart-discount" data-value={discount_total || 0}>
                                    - {currency(discount_total)}
                                </span>
                            </dd>
                        </div>
                    )}

                    <Separator className="my-2" />
                    <div className="flex justify-between">
                        <dt className="text-sm font-semibold text-default-500">Total</dt>
                        <dd className="text-sm font-semibold text-default-900">
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
