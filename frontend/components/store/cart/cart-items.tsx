"use client";

import React from "react";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import LineItemPrice from "@modules/common/components/line-item-price";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { CartItem } from "@/types/models";
import { useCartItem } from "@/lib/hooks/useCart";
import LocalizedClientLink from "@/components/ui/link";
import Control from "@/components/store/cart/control";
import { currency } from "@/lib/util/util";
import CartItemComponent from "./cart-item";

type ItemsTemplateProps = {
    className?: string;
};

const CartItems: React.FC<ItemsTemplateProps> = ({ className }) => {
    const { data: items, isLoading } = useCartItem();

    if (isLoading) return <div>Loading cart...</div>;
    if (!items?.length) return <div>No items in cart</div>;

    return (
        <div className={cn("flex flex-col gap-y-4 overflow-y-auto", className)}>
            {items.map((item: CartItem, idx: number) => (
                <CartItemComponent key={idx} item={item} />
            ))}
        </div>
    );
};

export default CartItems;
