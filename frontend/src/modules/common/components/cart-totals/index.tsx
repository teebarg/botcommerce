"use client";

import { formatAmount } from "@lib/util/prices";
import { InformationCircleSolid } from "nui-react-icons";
import { Tooltip } from "@nextui-org/tooltip";
import React from "react";

type CartTotalsProps = {
    data: Omit<any, "refundable_amount" | "refunded_total"> | any;
};

const CartTotals: React.FC<CartTotalsProps> = ({ data }) => {
    const { subtotal, discount_total, gift_card_total, tax_total, shipping_total, total } = data;

    const getAmount = (amount: number | null | undefined) => {
        return formatAmount({
            amount: amount || 0,
            region: data.region,
            includeTaxes: false,
        });
    };

    return (
        <>
            <div>
                <dl className="flex flex-col gap-4 py-4">
                    <div className="flex justify-between">
                        <dt className="text-small text-default-500">
                            <span className="flex gap-x-1 items-center">
                                Subtotal
                                <Tooltip content="Cart total excluding shipping and taxes." placement="right">
                                    <span>
                                        <InformationCircleSolid />
                                    </span>
                                </Tooltip>
                            </span>
                        </dt>
                        <dd className="text-small font-semibold text-default-700">
                            <span data-testid="cart-subtotal" data-value={subtotal || 0}>
                                {getAmount(subtotal)}
                            </span>
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-small text-default-500">Delivery</dt>
                        <dd className="text-small font-semibold text-default-700">
                            <span data-testid="cart-shipping" data-value={shipping_total || 0}>
                                {getAmount(shipping_total)}
                            </span>
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-small text-default-500">Taxes</dt>
                        <dd className="text-small font-semibold text-default-700">
                            <span data-testid="cart-taxes" data-value={tax_total || 0}>
                                {getAmount(tax_total)}
                            </span>
                        </dd>
                    </div>
                    {!!discount_total && (
                        <div className="flex justify-between">
                            <dt className="text-small text-default-500">Discount</dt>
                            <dd className="text-small font-semibold text-success">
                                <span className="text-blue-500" data-testid="cart-discount" data-value={discount_total || 0}>
                                    - {getAmount(discount_total)}
                                </span>
                            </dd>
                        </div>
                    )}
                    {!!gift_card_total && (
                        <div className="flex items-center justify-between">
                            <span>Gift card</span>
                            <span className="text-blue-500" data-testid="cart-gift-card-amount" data-value={gift_card_total || 0}>
                                - {getAmount(gift_card_total)}
                            </span>
                        </div>
                    )}

                    <hr className="tb-divider" />
                    <div className="flex justify-between">
                        <dt className="text-small font-semibold text-default-500">Total</dt>
                        <dd className="text-small font-semibold text-default-700">
                            <span className="text-lg" data-testid="cart-total" data-value={total || 0}>
                                {getAmount(total)}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
        </>
    );
};

export default CartTotals;
