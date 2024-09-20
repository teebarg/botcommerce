"use client";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import React from "react";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import LineItemPrice from "@modules/common/components/line-item-price";
import Image from "next/image";

import Control from "./control";
import { CartItem } from "types/global";

type ItemsTemplateProps = {
    items?: CartItem[];
};

const ItemsPreviewTemplate = ({ items }: ItemsTemplateProps) => {
    return (
        <React.Fragment>
            <ul className="max-h-[40vh] overflow-y-auto">
                {items
                    ?.sort((a: CartItem, b: CartItem) => {
                        return a.created_at > b.created_at ? -1 : 1;
                    })
                    ?.map((item: CartItem, key: number) => (
                        <li key={key} className="flex items-center gap-x-4 border-b-sm border-divider py-4">
                            <div className="relative flex h-16 w-14 flex-shrink-0 items-center justify-center rounded-md overflow-hidden">
                                <Image fill alt={item.name} src={item.image as string} />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <div className="text-sm">
                                    <LocalizedClientLink href={`/products/${item.slug}`} role="link">
                                        <p className="font-semibold text-default-800 truncate max-w-40">{item.name}</p>
                                    </LocalizedClientLink>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Control item={item} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-default-500">{item.quantity}x</span>
                                    <span className="text-sm font-semibold text-default-700">
                                        <LineItemUnitPrice item={item} style="tight" />
                                    </span>
                                </div>
                                <div>
                                    <LineItemPrice item={item} />
                                </div>
                            </div>
                        </li>
                    ))}
            </ul>
        </React.Fragment>
    );
};

export default ItemsPreviewTemplate;
