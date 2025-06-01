"use client";

import { HeartFilled, Heart } from "nui-react-icons";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addWish, removeWish } from "@/actions/user";
import { Product } from "@/types/models";

interface ComponentProps {
    product: Product;
    inWishlist: boolean;
    className?: string;
}

const ProductWishList: React.FC<ComponentProps> = ({ product, inWishlist, className }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const handleClick = async () => {
        setIsLoading(true);
        try {
            let res;

            if (inWishlist) {
                res = await removeWish(product.id!);
            } else {
                res = await addWish(product.id!);
            }

            if (!res.success) {
                toast.error(res.error as string);

                return;
            }

            toast.success(`Product Successfully ${inWishlist ? "removed" : "added"} to wishlist`);
        } catch (error: any) {
            toast.error("An error occurred, please contact support");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            className={cn("rounded-full px-0 gap-0 min-w-8 data-[hover=true]:opacity-hover z-20 text-secondary-500 bg-transparent", className)}
            disabled={isLoading}
            onClick={handleClick}
        >
            {inWishlist ? <HeartFilled className="h-8 w-8" /> : <Heart className="h-8 w-8" />}
        </Button>
    );
};

export { ProductWishList };
