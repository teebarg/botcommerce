import React from "react";
import { currency } from "@/lib/utils";
import { CartItem } from "@/types/models";
import CartControl from "./cart-control";

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
    return (
        <div className="flex gap-3">
            <div className="relative">
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg bg-content2 ring-1 ring-default-100">
                    <img alt={item.name} className="h-full w-full object-cover object-center" src={item.image} />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-default-900 line-clamp-2 leading-tight text-md">{item.name}</h3>
                </div>

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
