"use client";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import LineItemPrice from "@modules/common/components/line-item-price";
import Thumbnail from "@modules/products/components/thumbnail";
import { Table } from "@modules/common/components/table";
import { CartItem } from "types/global";

type ItemsProps = {
    items: CartItem[];
};

const Items = ({ items }: ItemsProps) => {
    return (
        <div className="flex flex-col">
            <Table columns={["Image", "", "Quantity", "Price", "Total"]} isDataOnly>
                {items
                    ?.sort((a: CartItem, b: CartItem) => (a.created_at > b.created_at ? -1 : 1))
                    .map((item: CartItem, index: number) => (
                        <tr key={index} className="even:bg-content2">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 sm:pl-3">
                                <LocalizedClientLink className="flex sm:w-20 w-12" href={`/products/${item?.slug}`}>
                                    <Thumbnail size="square" thumbnail={item.image} />
                                </LocalizedClientLink>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <p className="font-medium text-default-800" data-testid="product-title">
                                    {item.name}
                                </p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <p>{item.quantity}</p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <LineItemUnitPrice item={item} style="tight" />
                            </td>
                            <td className="relative whitespace-nowrap px-3 py-4 text-sm font-medium">
                                <LineItemPrice item={item} />
                            </td>
                        </tr>
                    ))}
            </Table>
        </div>
    );
};

export default Items;
