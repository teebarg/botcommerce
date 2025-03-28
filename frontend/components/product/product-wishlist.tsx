"use client";

import { HeartFilled, Heart } from "nui-react-icons";
import { useSnackbar } from "notistack";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/util/cn";
import { addWish, removeWish } from "@/actions/user";
import { Product } from "@/types/models";

interface ComponentProps {
    product: Product;
    inWishlist: boolean;
    className?: string;
}

const ProductWishList: React.FC<ComponentProps> = ({ product, inWishlist, className }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
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
                enqueueSnackbar(res.error, { variant: "error" });

                return;
            }

            enqueueSnackbar(`Product Successfully ${inWishlist ? "removed" : "added"} to wishlist`, { variant: "success" });
        } catch (error: any) {
            enqueueSnackbar("An error occurred, please contact support", { variant: "error" });
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
