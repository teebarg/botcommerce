import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useMemo } from "react";
import useToggleState from "@lib/hooks/use-toggle-state";
import ChevronDown from "@modules/common/icons/chevron-down";
import X from "@modules/common/icons/x";
import { getProductPrice } from "@lib/util/get-product-price";
import clsx from "clsx";
import Button from "@modules/common/components/button";

import OptionSelect from "../option-select";

type MobileActionsProps = {
    product: any;
    variant?: any;
    region: any;
    options: Record<string, string>;
    updateOptions: (update: Record<string, string>) => void;
    inStock?: boolean;
    handleAddToCart: () => void;
    isAdding?: boolean;
    show: boolean;
    optionsDisabled: boolean;
};

const MobileActions: React.FC<MobileActionsProps> = ({
    product,
    variant,
    options,
    updateOptions,
    inStock,
    handleAddToCart,
    isAdding,
    show,
    optionsDisabled,
}) => {
    const { state, open, close } = useToggleState();

    const price = getProductPrice({
        product: product,
        variantId: variant?.id,
    });

    const selectedPrice = useMemo(() => {
        if (!price) {
            return null;
        }
        const { variantPrice, cheapestPrice } = price;

        return variantPrice || cheapestPrice || null;
    }, [price]);

    return (
        <>
            <div
                className={clsx("lg:hidden inset-x-0 bottom-0 fixed", {
                    "pointer-events-none": !show,
                })}
            >
                <Transition
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    show={show}
                >
                    <div
                        className="bg-white flex flex-col gap-y-3 justify-center items-center text-lg p-4 h-full w-full border-t border-gray-200"
                        data-testid="mobile-actions"
                    >
                        <div className="flex items-center gap-x-2">
                            <span data-testid="mobile-title">{product.title}</span>
                            <span>—</span>
                            {selectedPrice ? (
                                <div className="flex items-end gap-x-2 text-default-800">
                                    {selectedPrice.price_type === "sale" && (
                                        <p>
                                            <span className="line-through text-sm">{selectedPrice.original_price}</span>
                                        </p>
                                    )}
                                    <span
                                        className={clsx({
                                            "text-blue-400": selectedPrice.price_type === "sale",
                                        })}
                                    >
                                        {selectedPrice.calculated_price}
                                    </span>
                                </div>
                            ) : (
                                <div />
                            )}
                        </div>
                        <div className="grid grid-cols-2 w-full gap-x-4">
                            <Button className="w-full" color="default" data-testid="mobile-actions-button" onClick={open}>
                                <div className="flex items-center justify-between w-full">
                                    <span>{variant ? Object.values(options).join(" / ") : "Select Options"}</span>
                                    <ChevronDown />
                                </div>
                            </Button>
                            <Button
                                className="w-full"
                                data-testid="mobile-cart-button"
                                disabled={!inStock || !variant}
                                isLoading={isAdding}
                                onClick={handleAddToCart}
                            >
                                {!variant ? "Select variant" : !inStock ? "Out of stock" : "Add to cart"}
                            </Button>
                        </div>
                    </div>
                </Transition>
            </div>
            <Transition appear as={Fragment} show={state}>
                <Dialog as="div" className="relative z-[75]" onClose={close}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed bottom-0 inset-x-0">
                        <div className="flex min-h-full h-full items-center justify-center text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Dialog.Panel
                                    className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                                    data-testid="mobile-actions-modal"
                                >
                                    <div className="w-full flex justify-end pr-6">
                                        <button
                                            className="bg-white w-12 h-12 rounded-full text-default-800 flex justify-center items-center"
                                            data-testid="close-modal-button"
                                            onClick={close}
                                        >
                                            <X />
                                        </button>
                                    </div>
                                    <div className="bg-white px-6 py-12">
                                        {product.variants.length > 1 && (
                                            <div className="flex flex-col gap-y-6">
                                                {(product.options || []).map((option: any) => {
                                                    return (
                                                        <div key={option.id}>
                                                            <OptionSelect
                                                                current={options[option.id]}
                                                                disabled={optionsDisabled}
                                                                option={option}
                                                                title={option.title}
                                                                updateOption={updateOptions}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default MobileActions;
