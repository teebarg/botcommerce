"use client";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import React from "react";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import LineItemPrice from "@modules/common/components/line-item-price";
import Image from "next/image";

import Control from "./control";

type ItemsTemplateProps = {
    items?: any[];
    region: any;
};

const ItemsPreviewTemplate = ({ items, region }: ItemsTemplateProps) => {
    return (
        <React.Fragment>
            <ul className="max-h-[40vh] overflow-y-auto">
                {items
                    ?.sort((a, b) => {
                        return a.created_at > b.created_at ? -1 : 1;
                    })
                    ?.map((item: any, key: number) => (
                        <li key={key} className="flex items-center gap-x-4 border-b-sm border-divider py-4">
                            <div className="relative flex h-16 w-14 flex-shrink-0 items-center justify-center rounded-md overflow-hidden">
                                <Image fill alt={item.title} src={item.thumbnail} />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <div className="text-sm">
                                    <LocalizedClientLink href={`/products/${item.variant.product.slug}`} role="link">
                                        <p className="font-semibold text-default-800 truncate max-w-40">{item.title}</p>
                                    </LocalizedClientLink>
                                    {item.variant.title && (
                                        <p
                                            className="inline-block text-sm text-default-600 w-full overflow-hidden text-ellipsis"
                                            data-testid="product-variant"
                                        >
                                            Variant: {item.variant.title}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Control item={item} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-default-500">{item.quantity}x</span>
                                    <span className="text-sm font-semibold text-default-700">
                                        <LineItemUnitPrice item={item} region={region} style="tight" />
                                    </span>
                                </div>
                                <div>
                                    <LineItemPrice item={item} region={region} style="tight" />
                                </div>
                            </div>
                        </li>
                    ))}
            </ul>
        </React.Fragment>
    );
};

export default ItemsPreviewTemplate;
