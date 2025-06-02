"use client";

import { Cart, HeartFilled } from "nui-react-icons";
import React, { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { ProductVariant } from "@/types/models";

interface WishlistItemProps {
    id: number;
    name: string;
    image: string;
    price: number;
    variants: ProductVariant[];
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, name, image, variants }) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const onRemove = async () => {
        // Handle later
        try {
            const { error } = await api.user.deleteWishlist(id);

            if (error) {
                toast.error(error);

                return;
            }

            toast.success("Product Successfully removed from wishlist");
        } catch (error: any) {
            toast.error("An error occurred, please contact support");
        }
    };

    // add the selected variant to the cart
    const handleAddToCart = async () => {
        if (variants.length == 0) {
            toast.error("Invalid variant");
        }
        setIsAdding(true);

        const { error } = await api.cart.add({
            variant_id: variants[0].id,
            quantity: 1,
        });

        if (error) {
            toast.error(error);
        }

        setIsAdding(false);
    };

    return (
        <>
            <div className="relative flex max-w-full flex-none flex-col gap-3 rounded-1xl md:bg-inherit w-full snap-start h-full" id={`${id}`}>
                <div className="relative flex max-h-full w-full flex-col items-center overflow-hidden rounded-xl bg-content2 h-64 md:h-80 justify-between">
                    <div className="relative md:rounded-1xl z-0 max-h-full w-full md:w-[80%] overflow-visible h-72">
                        <Image fill alt={name} className="hover:scale-95" src={image as string} />
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="font-medium line-clamp-1">{name}</h3>
                </div>
                <div className="flex gap-3">
                    <Button
                        className={"flex-1"}
                        color="primary"
                        disabled={isAdding}
                        isLoading={isAdding}
                        startContent={<Cart className="w-6 h-6" />}
                        onClick={handleAddToCart}
                    >
                        <span>Add to Cart</span>
                    </Button>

                    <button aria-label="remove from wishlist" className={cn("transition-colors text-secondary")} onClick={onRemove}>
                        <HeartFilled className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default WishlistItem;
