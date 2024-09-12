"use client";

import { Popover, Transition } from "@headlessui/react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { formatAmount } from "@lib/util/prices";
import DeleteButton from "@modules/common/components/delete-button";
import LineItemPrice from "@modules/common/components/line-item-price";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Thumbnail from "@modules/products/components/thumbnail";
import Button from "@modules/common/components/button";

const CartDropdown = ({ cart: cartState }: { cart?: Omit<any, "beforeInsert" | "afterLoad"> | null }) => {
    const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(undefined);
    const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

    const open = () => setCartDropdownOpen(true);
    const close = () => setCartDropdownOpen(false);

    const totalItems =
        cartState?.items?.reduce((acc, item) => {
            return acc + item.quantity;
        }, 0) ?? 0;

    const itemRef = useRef<number>(totalItems || 0);

    const timedOpen = () => {
        open();

        const timer = setTimeout(close, 5000);

        setActiveTimer(timer);
    };

    const openAndCancel = () => {
        if (activeTimer) {
            clearTimeout(activeTimer as unknown as number);
        }

        open();
    };

    // Clean up the timer when the component unmounts
    useEffect(() => {
        return () => {
            if (activeTimer) {
                clearTimeout(activeTimer as unknown as number);
            }
        };
    }, [activeTimer]);

    const pathname = usePathname();

    // open cart dropdown when modifying the cart items, but only if we're not on the cart page
    useEffect(() => {
        if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
            timedOpen();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalItems, itemRef.current]);

    return (
        <div className="h-full z-50" onMouseEnter={openAndCancel} onMouseLeave={close}>
            <Popover className="relative h-full">
                <Popover.Button className="h-full">
                    <LocalizedClientLink
                        className="hover:text-default-800"
                        data-testid="nav-cart-link"
                        href="/cart"
                    >{`Cart (${totalItems})`}</LocalizedClientLink>
                </Popover.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                    show={cartDropdownOpen}
                >
                    <Popover.Panel
                        static
                        className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-default-800"
                        data-testid="nav-cart-dropdown"
                    >
                        <div className="p-4 flex items-center justify-center">
                            <h3 className="text-lg">Cart</h3>
                        </div>
                        {cartState && cartState.items?.length ? (
                            <>
                                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                                    {cartState.items
                                        .sort((a, b) => {
                                            return a.created_at > b.created_at ? -1 : 1;
                                        })
                                        .map((item) => (
                                            <div key={item.id} className="grid grid-cols-[122px_1fr] gap-x-4" data-testid="cart-item">
                                                <LocalizedClientLink className="w-24" href={`/products/${item.variant.product.handle}`}>
                                                    <Thumbnail size="square" thumbnail={item.thumbnail} />
                                                </LocalizedClientLink>
                                                <div className="flex flex-col justify-between flex-1">
                                                    <div className="flex flex-col flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                                                <h3 className="text-base overflow-hidden text-ellipsis">
                                                                    <LocalizedClientLink
                                                                        data-testid="product-link"
                                                                        href={`/products/${item.variant.product.handle}`}
                                                                    >
                                                                        {item.title}
                                                                    </LocalizedClientLink>
                                                                </h3>
                                                                {item.variant.title && (
                                                                    <p
                                                                        className="inline-block text-sm text-default-600 w-full overflow-hidden text-ellipsis"
                                                                        data-testid="product-variant"
                                                                    >
                                                                        Variant: {item.variant.title}
                                                                    </p>
                                                                )}
                                                                <span data-testid="cart-item-quantity" data-value={item.quantity}>
                                                                    Quantity: {item.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <LineItemPrice item={item} region={cartState.region} style="tight" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DeleteButton className="mt-1" data-testid="cart-item-remove-button" id={item.id}>
                                                        Remove
                                                    </DeleteButton>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <div className="p-4 flex flex-col gap-y-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-default-800 font-semibold">
                                            Subtotal <span className="font-normal">(excl. taxes)</span>
                                        </span>
                                        <span className="text-lg" data-testid="cart-subtotal" data-value={cartState.subtotal || 0}>
                                            {formatAmount({
                                                amount: cartState.subtotal || 0,
                                                region: cartState.region,
                                                includeTaxes: false,
                                            })}
                                        </span>
                                    </div>
                                    <LocalizedClientLink passHref href="/cart">
                                        <Button className="w-full" data-testid="go-to-cart-button" size="lg">
                                            Go to cart
                                        </Button>
                                    </LocalizedClientLink>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                                    <div className="bg-gray-900 text-sm flex items-center justify-center w-6 h-6 rounded-full text-white">
                                        <span>0</span>
                                    </div>
                                    <span>Your shopping bag is empty.</span>
                                    <div>
                                        <LocalizedClientLink href="/collections">
                                            <>
                                                <Button onClick={close}>Explore products</Button>
                                            </>
                                        </LocalizedClientLink>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Popover.Panel>
                </Transition>
            </Popover>
        </div>
    );
};

export default CartDropdown;
