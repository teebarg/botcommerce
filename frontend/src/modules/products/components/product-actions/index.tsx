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
    region: any;
    disabled?: boolean;
};

export type PriceType = {
    calculated_price: string;
    original_price?: string;
    price_type?: "sale" | "default";
    percentage_diff?: string;
};

export default function ProductActions({ product, region, disabled }: ProductActionsProps) {
    const [options, setOptions] = useState<Record<string, string>>({});
    const [isAdding, setIsAdding] = useState(false);

    const countryCode = useParams().countryCode as string;

    const variants = product.variants;

    // initialize the option state
    useEffect(() => {
        const optionObj: Record<string, string> = {};

        for (const option of product.options || []) {
            Object.assign(optionObj, { [option.id]: undefined });
        }

        setOptions(optionObj);
    }, [product]);

    // memoized record of the product's variants
    const variantRecord = useMemo(() => {
        const map: Record<string, Record<string, string>> = {};

        for (const variant of variants) {
            if (!variant.options || !variant.id) continue;

            const temp: Record<string, string> = {};

            for (const option of variant.options) {
                temp[option.option_id] = option.value;
            }

            map[variant.id] = temp;
        }

        return map;
    }, [variants]);

    // memoized function to check if the current options are a valid variant
    const variant = useMemo(() => {
        let variantId: string | undefined = undefined;

        for (const key of Object.keys(variantRecord)) {
            if (isEqual(variantRecord[key], options)) {
                variantId = key;
            }
        }

        return variants.find((v) => v.id === variantId);
    }, [options, variantRecord, variants]);

    // if product only has one variant, then select it
    useEffect(() => {
        if (variants.length === 1 && variants[0].id) {
            setOptions(variantRecord[variants[0].id]);
        }
    }, [variants, variantRecord]);

    // update the options when a variant is selected
    const updateOptions = (update: Record<string, string>) => {
        setOptions({ ...options, ...update });
    };

    // check if the selected variant is in stock
    const inStock = useMemo(() => {
        // If we don't manage inventory, we can always add to cart
        if (variant && !variant.manage_inventory) {
            return true;
        }

        // If we allow back orders on the variant, we can add to cart
        if (variant && variant.allow_backorder) {
            return true;
        }

        // If there is inventory available, we can add to cart
        if (variant?.inventory_quantity && variant.inventory_quantity > 0) {
            return true;
        }

        // Otherwise, we can't add to cart
        return false;
    }, [variant]);

    const actionsRef = useRef<HTMLDivElement>(null);

    const inView = useIntersection(actionsRef, "0px");

    // add the selected variant to the cart
    const handleAddToCart = async () => {
        if (!variant?.id) return null;

        setIsAdding(true);

        await addToCart({
            variantId: variant.id,
            quantity: 1,
            countryCode,
        });

        setIsAdding(false);
    };

    return (
        <>
            <div ref={actionsRef} className="space-y-2">
                <div>
                    {product.variants.length > 1 && (
                        <div className="flex flex-col gap-y-2">
                            {(product.options || []).map((option) => {
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

                <ProductPrice product={product} region={region} variant={variant} />

                <Button
                    className="w-full h-10"
                    color="default"
                    data-testid="add-product-button"
                    disabled={!inStock || !variant || !!disabled || isAdding}
                    isLoading={isAdding}
                    onClick={handleAddToCart}
                >
                    {!variant ? "Select variant" : !inStock ? "Out of stock" : "Add to cart"}
                </Button>
                <MobileActions
                    handleAddToCart={handleAddToCart}
                    inStock={inStock}
                    isAdding={isAdding}
                    options={options}
                    optionsDisabled={!!disabled || isAdding}
                    product={product}
                    region={region}
                    show={!inView}
                    updateOptions={updateOptions}
                    variant={variant}
                />
            </div>
        </>
    );
}
