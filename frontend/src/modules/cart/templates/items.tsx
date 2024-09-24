"use client";

import LineItemPrice from "@modules/common/components/line-item-price";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import Thumbnail from "@modules/products/components/thumbnail";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Table } from "@modules/common/components/table";
import { CartItem } from "types/global";

import Control from "./control";

type ItemsTemplateProps = {
    items: CartItem[];
};

const ItemsTemplate = ({ items }: ItemsTemplateProps) => {
    return (
        <div>
            <div className="pb-3 flex items-center">
                <h3 className="text-[2rem] leading-[2.75rem]">Cart</h3>
            </div>
            <Table isDataOnly columns={["Item", "", "Quantity", "Price", "Total"]}>
                {items
                    ?.sort((a: CartItem, b: CartItem) => (a.created_at > b.created_at ? -1 : 1))
                    .map((item: CartItem) => (
                        <tr key={item.product_id} className="even:bg-content2">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 sm:pl-3">
                                <LocalizedClientLink className="flex sm:w-24 w-12" href={`/products/${item?.slug}`}>
                                    <Thumbnail size="square" thumbnail={item.image} />
                                </LocalizedClientLink>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <p className="font-medium text-default-800" data-testid="product-title">
                                    {item.name}
                                </p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <Control item={item} />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <LineItemUnitPrice item={item} style="tight" />
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                <span className="!pr-0">
                                    <LineItemPrice item={item} />
                                </span>
                            </td>
                        </tr>
                    ))}
            </Table>
        </div>
    );
};

export default ItemsTemplate;
