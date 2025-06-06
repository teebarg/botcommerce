"use client";

import React from "react";

import CartItemComponent from "./cart-item";

import { cn } from "@/lib/utils";
import { CartItem } from "@/types/models";
import { useCartItem } from "@/lib/hooks/useCart";
import { Skeleton } from "@/components/ui/skeletons";

type ItemsTemplateProps = {
    className?: string;
};

const CartItems: React.FC<ItemsTemplateProps> = ({ className }) => {
    const { data: items, isLoading } = useCartItem();

    if (isLoading) return <Skeleton className="h-[400px]" />;

    return (
        <div className={cn("flex flex-col gap-y-4 overflow-y-auto", className)}>
            {items?.map((item: CartItem, idx: number) => <CartItemComponent key={idx} item={item} />)}
            {items?.length === 0 && <div className="text-center">No items in cart</div>}
        </div>
    );
};

export default CartItems;
