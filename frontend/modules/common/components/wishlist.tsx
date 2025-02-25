"use client";

import { Cart, HeartFilled } from "nui-react-icons";
import React, { useState } from "react";
import { useSnackbar } from "notistack";
import Image from "next/image";

import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";
import { removeWish } from "@/actions/user";
import { api } from "@/apis";

interface WishlistItemProps {
    id: number;
    name: string;
    image: string;
    price: number;
    description: string;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, name, image }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const onRemove = async () => {
        // Handle later
        try {
            const res = await removeWish(id);

            if (!res.success) {
                enqueueSnackbar(res.error, { variant: "error" });

                return;
            }

            enqueueSnackbar("Product Successfully removed from wishlist", { variant: "success" });
        } catch (error: any) {
            enqueueSnackbar("An error occurred, please contact support", { variant: "error" });
        }
    };

    // add the selected variant to the cart
    const handleAddToCart = async () => {
        setIsAdding(true);

        await api.cart.add({
            product_id: id.toString(),
            quantity: 1,
        });

        setIsAdding(false);
    };

    return (
        <>
            <div className="relative flex max-w-full flex-none flex-col gap-3 rounded-1xl md:bg-content1 w-full snap-start h-full" id={`${id}`}>
                <div className="relative flex max-h-full w-full flex-col items-center overflow-hidden rounded-xl bg-content2 h-[16rem] md:h-[20rem] justify-between">
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

                    <button aria-label="remove from sihslist" className={cn("transition-colors text-secondary")} onClick={onRemove}>
                        <HeartFilled className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default WishlistItem;
