"use client";

import React from "react";

import CartItemComponent from "./cart-item";

import { cn } from "@/lib/utils";
import { CartItem } from "@/schemas";
import { Skeleton } from "@/components/ui/skeletons";
import { useCart } from "@/providers/cart-provider";

type ItemsTemplateProps = {
    className?: string;
};

const CartItems: React.FC<ItemsTemplateProps> = ({ className }) => {
    const { cartItems, isLoading } = useCart();

    if (isLoading) return <Skeleton className="h-[400px]" />;

    return (
        <div className={cn("flex flex-col gap-y-4 overflow-y-auto", className)}>
            {cartItems?.map((item: CartItem, idx: number) => <CartItemComponent key={idx} item={item} />)}
            {cartItems?.length === 0 && <div className="text-center">No items in cart</div>}
        </div>
    );
};

export default CartItems;
