"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntersection } from "@lib/hooks/use-in-view";
import { addToCart } from "@modules/cart/actions";
import OptionSelect from "@modules/products/components/option-select";
import { isEqual } from "@lib/util/util";
import Button from "@modules/common/components/button";

import MobileActions from "../mobile-actions";
import ProductPrice from "../product-price";

type ProductActionsProps = {
    product: any;
    disabled?: boolean;
};

export type PriceType = {
    calculated_price: string;
    original_price?: string;
    price_type?: "sale" | "default";
    percentage_diff?: string;
};

export default function ProductActions({ product, disabled }: ProductActionsProps) {
    if (!product) {
        return null;
    }
    const [options, setOptions] = useState<Record<string, string>>({});
    const [isAdding, setIsAdding] = useState(false);

    const countryCode = useParams().countryCode as string;


    // initialize the option state
    useEffect(() => {
        const optionObj: Record<string, string> = {};

        for (const option of product.options || []) {
            Object.assign(optionObj, { [option.id]: undefined });
        }

        setOptions(optionObj);
    }, [product]);


    useEffect(() => {
        setOptions(product.id);
    }, [product]);

    const updateOptions = (update: Record<string, string>) => {
        setOptions({ ...options, ...update });
    };

    // check if the selected variant is in stock
    const inStock = useMemo(() => {
        // If we don't manage inventory, we can always add to cart
        if (product.inventory) {
            return true;
        }

        // Otherwise, we can't add to cart
        return false;
    }, []);

    const actionsRef = useRef<HTMLDivElement>(null);

    const inView = useIntersection(actionsRef, "0px");

    // add the selected variant to the cart
    const handleAddToCart = async () => {
        setIsAdding(true);

        await addToCart({
            quantity: 1
        });

        setIsAdding(false);
    };

    return (
        <>
            <div ref={actionsRef} className="space-y-2">
                <div>
                    {product.length > 1 && (
                        <div className="flex flex-col gap-y-2">
                            {(product.options || []).map((option: any) => {
                                return (
                                    <div key={option.id}>
                                        <OptionSelect
                                            current={options[option.id]}
                                            data-testid="product-options"
                                            disabled={!!disabled || isAdding}
                                            option={option}
                                            title={option.title}
                                            updateOption={updateOptions}
                                        />
                                    </div>
                                );
                            })}
                            <hr className="tb-divider" />
                        </div>
                    )}
                </div>

                <ProductPrice product={product} />

                <Button
                    className="w-full h-10"
                    color="default"
                    data-testid="add-product-button"
                    disabled={!inStock || !!disabled || isAdding}
                    isLoading={isAdding}
                    onClick={handleAddToCart}
                >
                    {!inStock ? "Out of stock" : "Add to cart"}
                </Button>
                {/* <MobileActions
                    handleAddToCart={handleAddToCart}
                    inStock={inStock}
                    isAdding={isAdding}
                    options={options}
                    optionsDisabled={!!disabled || isAdding}
                    product={product}
                    show={!inView}
                    updateOptions={updateOptions}
                    variant={variant}
                /> */}
            </div>
        </>
    );
}
