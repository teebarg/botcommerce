"use client";

import React, { useMemo, useState } from "react";
import { currency } from "@lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Info, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";

const DiscountCode: React.FC = () => {
    const { cart, isLoading } = useCart();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { discounts, gift_cards } = cart || {};

    const appliedDiscount = useMemo(() => {
        if (!discounts || !discounts.length) {
            return undefined;
        }

        switch (discounts[0].rule.type) {
            case "percentage":
                return `${discounts[0].rule.value}%`;
            case "fixed":
                return `- ${currency(discounts[0].rule.value)}`;

            default:
                return "Free shipping";
        }
    }, [discounts]);

    const removeGiftCardCode = async (code: string) => {
        // TODO
    };

    const removeDiscountCode = async () => {
        // TODO
    };

    if (isLoading) return <ComponentLoader className="h-[100px]" />;

    return (
        <div className="w-full flex flex-col">
            <div className="txt-medium">
                {gift_cards?.length > 0 && (
                    <div className="flex flex-col mb-4">
                        <h2 className="text-lg font-medium">Gift card(s) applied:</h2>
                        {gift_cards?.map((gc: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between txt-small-plus" data-testid="gift-card">
                                <p className="flex gap-x-1 items-baseline">
                                    <span>Code: </span>
                                    <span className="truncate" data-testid="gift-card-code">
                                        {gc.code}
                                    </span>
                                </p>
                                <p className="font-semibold" data-testid="gift-card-amount" data-value={gc.balance}>
                                    {currency(gc.balance)}
                                </p>
                                <button
                                    aria-label="remove gift card"
                                    className="flex items-center gap-x-2 !background-transparent border-none!"
                                    data-testid="remove-gift-card-button"
                                    onClick={() => removeGiftCardCode(gc.code)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {appliedDiscount ? (
                    <div className="w-full flex items-center">
                        <div className="flex flex-col w-full">
                            <h2 className="text-lg font-medium">Discount applied:</h2>
                            <div className="flex items-center justify-between w-full max-w-full" data-testid="discount-row">
                                <p className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                                    <span>Code:</span>
                                    <span className="truncate" data-testid="discount-code">
                                        {discounts[0].code}
                                    </span>
                                    <span className="min-w-fit" data-testid="discount-amount" data-value={discounts[0]?.rule?.value}>
                                        ({appliedDiscount})
                                    </span>
                                </p>
                                <button
                                    aria-label="remove discount"
                                    className="flex items-center"
                                    data-testid="remove-discount-button"
                                    onClick={removeDiscountCode}
                                >
                                    <Trash2 size={14} />
                                    <span className="sr-only">Remove discount code from order</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="w-full">
                        <span className="flex gap-x-1 my-2 items-center">
                            <button
                                aria-label="add gift card"
                                className="text-sm font-medium text-blue-500"
                                data-testid="add-discount-button"
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                Add gift card or discount code
                            </button>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="size-4 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>You can add multiple gift cards, but only one discount code.</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        {isOpen && (
                            <div className="flex w-full gap-x-2 items-center">
                                <Input className="flex-1" data-testid="discount-input" name="code" type="text" />
                                <Button aria-label="apply" className="px-4 min-w-20 text-sm gap-2" type="submit">
                                    Apply
                                </Button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default DiscountCode;
