"use client";

import { XMark } from "nui-react-icons";
import React from "react";
import Help from "@modules/order/components/help";
import OrderDetails from "@modules/order/components/order-details";
import OrderSummary from "@modules/order/components/order-summary";
import ShippingDetails from "@modules/order/components/shipping-details";
import { Order } from "types/global";

import Items from "@/components/order/cart-details";
import LocalizedClientLink from "@/components/ui/link";

type OrderDetailsTemplateProps = {
    order: Order;
};

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({ order }) => {
    return (
        <div className="flex flex-col justify-center gap-y-4">
            <div className="flex gap-2 justify-between items-center">
                <h1 className="text-2xl">Order details</h1>
                <LocalizedClientLink
                    className="flex gap-2 items-center text-default-500 hover:text-default-900"
                    data-testid="back-to-overview-button"
                    href="/account/orders"
                >
                    <XMark /> Back to overview
                </LocalizedClientLink>
            </div>
            <div className="flex flex-col gap-4 h-full w-full" data-testid="order-details-container">
                <OrderDetails showStatus order={order} />
                <Items items={order.line_items} />
                <ShippingDetails order={order} />
                <OrderSummary order={order} />
                <Help />
            </div>
        </div>
    );
};

export default OrderDetailsTemplate;
