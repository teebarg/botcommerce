"use client";

import { InformationCircleSolid } from "nui-react-icons";
import React from "react";
import { currency } from "@lib/util/util";
import { Tooltip } from "@components/ui/tooltip";

import { Cart } from "@/types/models";

type CartTotalsProps = {
    data: Omit<Cart, "refundable_amount" | "refunded_total">;
};

const CartTotals: React.FC<CartTotalsProps> = ({ data }) => {
    const { discount_total, tax, total, subtotal } = data;

    return (
        <>
            <div>
                <dl className="flex flex-col gap-4 py-4">
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
                            <span data-testid="cart-shipping" data-value={data.shipping_fee || 0}>
                                {currency(data.shipping_fee)}
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

                    <hr className="tb-divider" />
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
