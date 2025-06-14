import { useMemo } from "react";
import { currency } from "@lib/utils";
import Image from "next/image";

import LocalizedClientLink from "@/components/ui/link";
import { Order, OrderItem } from "@/schemas";

type OrderCardProps = {
    order: Omit<Order, "beforeInsert">;
};

const OrderCard = ({ order }: OrderCardProps) => {
    const numberOfLines = useMemo(() => {
        return order.order_items.reduce((acc: number, item: OrderItem) => {
            return acc + item.quantity;
        }, 0);
    }, [order]);

    const numberOfProducts = useMemo(() => {
        return order.order_items.length;
    }, [order]);

    return (
        <div className="bg-content2 flex flex-col p-4 rounded-lg" data-testid="order-card">
            <div className="uppercase text-lg mb-1 text-ellipsis overflow-hidden" data-testid="order-display-id">
                {order.order_number}
            </div>
            <div className="flex items-center divide-x divide-gray-50 text-sm text-default-500">
                <span className="pr-2" data-testid="order-created-at">
                    {new Date(order.created_at).toDateString()}
                </span>
                <span className="px-2" data-testid="order-amount">
                    {currency(order.total)}
                </span>
                <span className="pl-2">{`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}</span>
            </div>
            <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
                {order.order_items.slice(0, 3).map((i: OrderItem, idx: number) => {
                    return (
                        <div key={idx} className="flex flex-col gap-y-2" data-testid="order-item">
                            <div className="h-20 w-20 relative">
                                {i.image && <Image fill alt={i.variant?.product?.name || i.image} src={i.image} />}
                            </div>
                            <div className="flex items-center text-sm text-default-500">
                                <span className="text-default-500 font-semibold" data-testid="item-title">
                                    {i.variant?.name}
                                </span>
                                <span className="ml-2">x</span>
                                <span data-testid="item-quantity">{i.quantity}</span>
                            </div>
                        </div>
                    );
                })}
                {numberOfProducts > 4 && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-sm text-default-900">+ {numberOfLines - 4}</span>
                        <span className="text-sm text-default-900">more</span>
                    </div>
                )}
            </div>
            <div className="flex justify-end">
                <LocalizedClientLink
                    className="underline text-primary"
                    data-testid="order-details-link"
                    href={`/account/orders/details/${order.order_number}`}
                >
                    See details
                </LocalizedClientLink>
            </div>
        </div>
    );
};

export default OrderCard;
