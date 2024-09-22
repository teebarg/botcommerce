import { useMemo } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Button from "@modules/common/components/button";
import { CartItem, Order } from "types/global";
import { currency } from "@lib/util/util";
import Image from "next/image";

type OrderCardProps = {
    order: Omit<Order, "beforeInsert">;
};

const OrderCard = ({ order }: OrderCardProps) => {
    const numberOfLines = useMemo(() => {
        return order.line_items.reduce((acc: number, item: CartItem) => {
            return acc + item.quantity;
        }, 0);
    }, [order]);

    const numberOfProducts = useMemo(() => {
        return order.line_items.length;
    }, [order]);

    return (
        <div className="bg-content2 flex flex-col p-4 rounded-lg" data-testid="order-card">
            <div className="uppercase text-lg mb-1">
                #<span data-testid="order-display-id">{order.order_id}</span>
            </div>
            <div className="flex items-center divide-x divide-gray-50 text-sm text-default-700">
                <span className="pr-2" data-testid="order-created-at">
                    {new Date(order.created_at).toDateString()}
                </span>
                <span className="px-2" data-testid="order-amount">
                    {currency(order.total)}
                </span>
                <span className="pl-2">{`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}</span>
            </div>
            <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
                {order.line_items.slice(0, 3).map((i: CartItem) => {
                    return (
                        <div key={i.item_id} className="flex flex-col gap-y-2" data-testid="order-item">
                            <div className="h-20 w-20 relative">
                                <Image src={i.image as string} alt={i.name} fill />
                            </div>
                            <div className="flex items-center text-sm text-default-700">
                                <span className="text-default-700 font-semibold" data-testid="item-title">
                                    {i.name}
                                </span>
                                <span className="ml-2">x</span>
                                <span data-testid="item-quantity">{i.quantity}</span>
                            </div>
                        </div>
                    );
                })}
                {numberOfProducts > 4 && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-sm text-default-700">+ {numberOfLines - 4}</span>
                        <span className="text-sm text-default-700">more</span>
                    </div>
                )}
            </div>
            <div className="flex justify-end">
                <LocalizedClientLink href={`/account/orders/details/${order.order_id}`}>
                    <Button color="default" data-testid="order-details-link">
                        See details
                    </Button>
                </LocalizedClientLink>
            </div>
        </div>
    );
};

export default OrderCard;
