import React from "react";

import { currency } from "@/lib/utils";
import { OrderItem } from "@/types/models";
import { Badge } from "@/components/ui/badge";

const OrderItemComponent: React.FC<{ item: OrderItem }> = ({ item }) => {
    return (
        <div className="flex gap-3 p-4">
            <div className="relative">
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg bg-content2 ring-1 ring-default-100">
                    <img alt={item.name} className="h-full w-full object-cover object-center" src={item?.image || "/placeholder.jpg"} />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-default-900 line-clamp-2 leading-tight text-md">{item.name}</h3>
                </div>

                {item.variant && (item.variant.size || item.variant.color) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.variant.size && <Badge variant="gray">Size: {item.variant.size}</Badge>}

                        {item.variant.color && (
                            <Badge variant="gray">
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-default-300 mr-1"
                                    style={{ backgroundColor: item.variant.color.toLowerCase() }}
                                ></div>
                                {item.variant.color}
                            </Badge>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <span>{item.quantity}x</span> <span className="font-semibold text-default-700 text-sm">{currency(Number(item.price) || 0)}</span>
                </div>

                <p className="text-lg font-semibold text-default-600 mt-1">Subtotal: {currency((Number(item.price) || 0) * item.quantity)}</p>
            </div>
        </div>
    );
};

export default OrderItemComponent;
