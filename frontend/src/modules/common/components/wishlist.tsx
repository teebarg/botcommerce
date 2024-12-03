"use client";

import { Cart, HeartFilledIcon } from "nui-react-icons";
import React from "react";

import { cn } from "@/lib/util/cn";

interface WishlistItemProps {
    id: string;
    name: string;
    image: string;
    price: string;
    description: string;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, name, image, price, description }) => {
    const onMoveToCart = (id: string) => {
        // Handle later
    };

    const onRemove = (id: string) => {
        // Handle later
    };

    return (
        <div className="group relative bg-background rounded-xl overflow-hidden border border-default/50">
            <div className="aspect-square overflow-hidden">
                <img
                    alt={name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    src={image}
                />
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    {/* <p className="text-sm font-medium text-muted-foreground">{brand}</p> */}
                    <h3 className="font-medium line-clamp-2">{name}</h3>
                    {/* <p className="text-lg font-semibold">${price.toLocaleString()}</p> */}
                </div>

                <div className="flex gap-3">
                    <button
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5",
                            "bg-primary text-primary-foreground rounded-md",
                            "hover:opacity-90 transition-opacity"
                        )}
                        onClick={() => onMoveToCart(id)}
                    >
                        <Cart className="w-4 h-4" />
                        <span>Move to Cart</span>
                    </button>

                    <button className={cn("transition-colors text-secondary")} onClick={() => onRemove(id)}>
                        <HeartFilledIcon className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistItem;
