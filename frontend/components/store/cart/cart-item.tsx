"use client";

import React from "react";

import CartControl from "./cart-control";

import { currency } from "@/lib/utils";
import { CartItem } from "@/schemas";
import { Badge } from "@/components/ui/badge";

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
    return (
        <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <img alt={item.name} className="object-cover w-full h-full rounded-lg" src={item?.image || "/placeholder.jpg"} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold line-clamp-2 leading-tight text-md">{item.name}</h3>
                </div>

                {item.variant && (item.variant.size || item.variant.color || item.variant.measurement || item.variant.age) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.variant.size && <Badge variant="contrast">Size: {item.variant.size}</Badge>}

                        {item.variant.color && (
                            <Badge variant="contrast">
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-border mr-1"
                                    style={{ backgroundColor: item.variant.color.toLowerCase() }}
                                />
                                {item.variant.color}
                            </Badge>
                        )}
                        {item.variant.measurement && <Badge variant="contrast">Measurement: {item.variant.measurement}</Badge>}
                        {item.variant.age && <Badge variant="contrast">Age: {item.variant.age}</Badge>}
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-xl">{currency(Number(item.price) || 0)}</span>
                </div>

                <CartControl item={item} />

                <p className="text-xs text-muted-foreground mt-1">Subtotal: {currency((Number(item.price) || 0) * item.quantity)}</p>
            </div>
        </div>
    );
};

export default CartItemComponent;
