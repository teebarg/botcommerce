"use client";

import React from "react";
import Image from "next/image";

import CartControl from "./cart-control";

import { currency } from "@/lib/utils";
import { CartItem } from "@/schemas";
import { Badge } from "@/components/ui/badge";

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
    return (
        <div className="flex gap-3">
            <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg bg-content2 ring-1 ring-default-100">
                <Image
                    fill
                    alt={item.name}
                    blurDataURL="/placeholder.jpg"
                    className="object-cover object-center rounded-lg"
                    placeholder="blur"
                    sizes="(max-width: 768px) 64px, 80px"
                    src={item?.image || "/placeholder.jpg"}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-default-900 line-clamp-2 leading-tight text-md">{item.name}</h3>
                </div>

                {item.variant && (item.variant.size || item.variant.color || item.variant.measurement) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.variant.size && <Badge variant="gray">Size: {item.variant.size}</Badge>}

                        {item.variant.color && (
                            <Badge variant="gray">
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-default-300 mr-1"
                                    style={{ backgroundColor: item.variant.color.toLowerCase() }}
                                />
                                {item.variant.color}
                            </Badge>
                        )}
                        {item.variant.measurement && <Badge variant="gray">Measurement: {item.variant.measurement}</Badge>}
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-default-900 text-xl">{currency(Number(item.price) || 0)}</span>
                </div>

                <CartControl item={item} />

                <p className="text-xs text-default-500 mt-1">Subtotal: {currency((Number(item.price) || 0) * item.quantity)}</p>
            </div>
        </div>
    );
};

export default CartItemComponent;
