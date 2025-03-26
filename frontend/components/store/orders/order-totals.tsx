"use client";

import { InformationCircleSolid } from "nui-react-icons";
import React from "react";
import { currency } from "@lib/util/util";
import { Tooltip } from "@components/ui/tooltip";

import { Order, OrderItem } from "@/types/models";

type OrderTotalsProps = {
    data: Order;
};

const OrderTotals: React.FC<OrderTotalsProps> = ({ data }) => {
    const sub_total = (items: OrderItem[]) => items?.reduce((total: number, item: OrderItem) => total + item.price * item.quantity, 0);
    const taxTotal = (items: OrderItem[]) => items?.reduce((total: number, item: OrderItem) => total + item.price * item.quantity * 0.05, 0);

    const subTotal = sub_total(data.order_items);
    const tax = taxTotal(data.order_items);
    const totalAmount = subTotal + data.shipping_fee + tax;

    return (
        <>
            <div>
                <dl className="flex flex-col gap-4 py-4">
                    <div className="flex justify-between">
                        <dt className="text-sm text-default-500">
                            <span className="flex gap-x-1 items-center">
                                Subtotal
                                <Tooltip content="Order total excluding shipping and taxes." position="right">
                                    <span>
                                        <InformationCircleSolid />
                                    </span>
                                </Tooltip>
                            </span>
                        </dt>
                        <dd className="text-sm font-semibold text-default-900">
                            <span data-testid="cart-subtotal" data-value={subTotal || 0}>
                                {currency(subTotal)}
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
                    <hr className="tb-divider" />
                    <div className="flex justify-between">
                        <dt className="text-sm font-semibold text-default-500">Total</dt>
                        <dd className="text-sm font-semibold text-default-900">
                            <span className="text-lg" data-testid="cart-total" data-value={totalAmount}>
                                {currency(totalAmount)}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
        </>
    );
};

export default OrderTotals;
