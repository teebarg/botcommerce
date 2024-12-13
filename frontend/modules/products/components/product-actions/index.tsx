"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@modules/cart/actions";
import { currency } from "@lib/util/util";
import Button from "@modules/common/components/button";
import { Product } from "types/global";

import { cn } from "@/lib/util/cn";

type ProductActionsProps = {
    product: Product;
    disabled?: boolean;
    showPrice?: boolean;
    wishlist?: React.ReactNode;
    btnClassName?: string;
    className?: string;
};

export default function ProductActions({ product, disabled, wishlist, btnClassName, className, showPrice = true }: ProductActionsProps) {
    const [isAdding, setIsAdding] = useState(false);

    // check if the selected variant is in stock
    const inStock = useMemo(() => {
        // If we don't manage inventory, we can always add to cart
        if (product.inventory) {
            return true;
        }

        // Otherwise, we can't add to cart
        return false;
    }, []);

    if (!product) {
        return null;
    }

    // add the selected variant to the cart
    const handleAddToCart = async () => {
        setIsAdding(true);

        await addToCart({
            product_id: product.id.toString(),
            quantity: 1,
        });

        setIsAdding(false);
    };

    return (
        <div className={cn("group", className)} data-has-price={showPrice}>
            <div className="hidden flex-col-reverse items-start mb-2 group-data-[has-price=true]:flex">
                <div className="flex items-center w-full">
                    <span className="text-xl font-semibold text-danger">{currency(product.price)}</span>
                    {product.old_price > product.price && (
                        <span className="ml-2 text-sm text-default-500 line-through">{currency(product.old_price)}</span>
                    )}
                    <div className="ml-auto">{wishlist}</div>
                </div>
                {product.old_price > product.price && (
                    <div className="mt-1 -mb-1.5">
                        <span className="text-sm font-medium text-green-600">
                            Save {(((product.old_price - product.price) / product.old_price) * 100).toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>

            <Button
                className={cn("w-full", btnClassName)}
                color="primary"
                data-testid="add-product-button"
                isDisabled={!inStock || !!disabled || isAdding}
                isLoading={isAdding}
                onPress={handleAddToCart}
            >
                {!inStock ? "Out of stock" : "Add to cart"}
            </Button>
        </div>
    );
}
