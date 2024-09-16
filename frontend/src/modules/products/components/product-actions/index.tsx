"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@modules/cart/actions";
import { currency } from "@lib/util/util";
import Button from "@modules/common/components/button";

type ProductActionsProps = {
    product: any;
    disabled?: boolean;
};

export default function ProductActions({ product, disabled }: ProductActionsProps) {
    if (!product) {
        return null;
    }
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

    // add the selected variant to the cart
    const handleAddToCart = async () => {
        setIsAdding(true);

        await addToCart({
            quantity: 1,
        });

        setIsAdding(false);
    };

    return (
        <>
            <div className="space-y-2">
                <div className="flex flex-col items-start mb-4">
                    <div className="flex items-center">
                        <span className="text-xl font-semibold text-danger">{currency(product.price)}</span>
                        {product.old_price > product.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">{currency(product.old_price)}</span>
                        )}
                    </div>
                    {product.old_price > product.price && (
                        <div className="mt-1">
                            <span className="text-sm font-medium text-green-600">
                                Save {(((product.old_price - product.price) / product.old_price) * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}
                </div>

                <Button
                    className="w-full"
                    color="default"
                    data-testid="add-product-button"
                    disabled={!inStock || !!disabled || isAdding}
                    isLoading={isAdding}
                    onClick={handleAddToCart}
                >
                    {!inStock ? "Out of stock" : "Add to cart"}
                </Button>
            </div>
        </>
    );
}
