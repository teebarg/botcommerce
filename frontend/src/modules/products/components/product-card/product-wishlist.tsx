"use client";

import { Product } from "types/global";
import { HeartFilledIcon, HeartIcon } from "nui-react-icons";
import { Button } from "@/components/ui/button";
import { useSnackbar } from "notistack";
import { addWish, removeWish } from "../../actions";
import { useState } from "react";
import { cn } from "@/lib/util/cn";

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
                res = await removeWish(product.id);
            } else {
                res = await addWish(product.id);
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
            onClick={handleClick}
            className={cn("rounded-full px-0 gap-0 min-w-8 data-[hover=true]:opacity-hover z-20 text-secondary-500 bg-transparent", className)}
            disabled={isLoading}
        >
            {inWishlist ? <HeartFilledIcon className="h-8 w-8" /> : <HeartIcon className="h-8 w-8" />}
        </Button>
    );
};

export { ProductWishList };
