"use client";

import { Cart, HeartFilledIcon } from "nui-react-icons";
import React, { useState } from "react";

import { cn } from "@/lib/util/cn";
import { useSnackbar } from "notistack";
import { removeWish } from "@/modules/products/actions";
import { addToCart } from "@/modules/cart/actions";
import { Button } from "@/components/ui/button";

interface WishlistItemProps {
    id: number;
    name: string;
    image: string;
    price: number;
    description: string;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, name, image, price, description }) => {
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

        await addToCart({
            product_id: id.toString(),
            quantity: 1,
        });

        setIsAdding(false);
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
                <div className="space-y-1">
                    {/* <p className="text-sm font-medium text-muted-foreground">{brand}</p> */}
                    <h3 className="font-medium line-clamp-1">{name}</h3>
                    <p className="text-default-500 line-clamp-1">{description}</p>
                    {/* <p className="text-lg font-semibold">${price.toLocaleString()}</p> */}
                </div>

                <div className="flex gap-3">
                    <Button
                        disabled={isAdding}
                        isLoading={isAdding}
                        startContent={<Cart className="w-6 h-6" />}
                        color="primary"
                        className={"flex-1"}
                        onClick={handleAddToCart}
                    >
                        <span>Add to Cart</span>
                    </Button>

                    <button className={cn("transition-colors text-secondary")} onClick={onRemove}>
                        <HeartFilledIcon className="w-10 h-10" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistItem;
