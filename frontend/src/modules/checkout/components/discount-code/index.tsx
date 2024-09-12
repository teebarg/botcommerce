"use client";

import { InformationCircleSolid } from "nui-react-icons";
import React, { useMemo } from "react";
import { useFormState } from "react-dom";
import Input from "@modules/common/components/input";
import Trash from "@modules/common/icons/trash";
import ErrorMessage from "@modules/checkout/components/error-message";
import { removeDiscount, removeGiftCard, submitDiscountForm } from "@modules/checkout/actions";
import { formatAmount } from "@lib/util/prices";
import { FormButton } from "@modules/common/components/form-button";
import { Tooltip } from "@nextui-org/tooltip";

type DiscountCodeProps = {
    cart: Omit<any, "refundable_amount" | "refunded_total">;
};

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const { discounts, gift_cards, region } = cart;

    const appliedDiscount = useMemo(() => {
        if (!discounts || !discounts.length) {
            return undefined;
        }

        switch (discounts[0].rule.type) {
            case "percentage":
                return `${discounts[0].rule.value}%`;
            case "fixed":
                return `- ${formatAmount({
                    amount: discounts[0].rule.value,
                    region: region,
                })}`;

            default:
                return "Free shipping";
        }
    }, [discounts, region]);

    const removeGiftCardCode = async (code: string) => {
        await removeGiftCard(code, gift_cards);
    };

    const removeDiscountCode = async () => {
        await removeDiscount(discounts[0].code);
    };

    const [message, formAction] = useFormState(submitDiscountForm, null);

    return (
        <div className="w-full flex flex-col">
            <div className="txt-medium">
                {gift_cards.length > 0 && (
                    <div className="flex flex-col mb-4">
                        <h2 className="text-lg font-medium">Gift card(s) applied:</h2>
                        {gift_cards?.map((gc) => (
                            <div key={gc.id} className="flex items-center justify-between txt-small-plus" data-testid="gift-card">
                                <p className="flex gap-x-1 items-baseline">
                                    <span>Code: </span>
                                    <span className="truncate" data-testid="gift-card-code">
                                        {gc.code}
                                    </span>
                                </p>
                                <p className="font-semibold" data-testid="gift-card-amount" data-value={gc.balance}>
                                    {formatAmount({
                                        region: region,
                                        amount: gc.balance,
                                        includeTaxes: false,
                                    })}
                                </p>
                                <button
                                    className="flex items-center gap-x-2 !background-transparent !border-none"
                                    data-testid="remove-gift-card-button"
                                    onClick={() => removeGiftCardCode(gc.code)}
                                >
                                    <Trash size={14} />
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
                                <button className="flex items-center" data-testid="remove-discount-button" onClick={removeDiscountCode}>
                                    <Trash size={14} />
                                    <span className="sr-only">Remove discount code from order</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form action={formAction} className="w-full">
                        <span className="flex gap-x-1 my-2 items-center">
                            <button
                                className="text-sm font-medium text-blue-500"
                                data-testid="add-discount-button"
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                Add gift card or discount code
                            </button>
                            <Tooltip content="You can add multiple gift cards, but only one discount code.">
                                <span>
                                    <InformationCircleSolid />
                                </span>
                            </Tooltip>
                        </span>
                        {isOpen && (
                            <>
                                <div className="flex w-full gap-x-2 items-center">
                                    <Input data-testid="discount-input" label="Please enter code" name="code" type="text" />
                                    <FormButton className="px-4 min-w-20 h-10 text-small gap-2">Apply</FormButton>
                                </div>
                                <ErrorMessage data-testid="discount-error-message" error={message} />
                            </>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default DiscountCode;
