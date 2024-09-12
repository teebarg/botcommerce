"use client";

import LineItemPrice from "@modules/common/components/line-item-price";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import Thumbnail from "@modules/products/components/thumbnail";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Table } from "@modules/common/components/table";

import Control from "./control";

type ItemsTemplateProps = {
    // items: Omit<LineItem, "beforeInsert">[];
    items: any[];
    region: any;
};

const ItemsTemplate = ({ items, region }: ItemsTemplateProps) => {
    return (
        <div>
            <div className="pb-3 flex items-center">
                <h3 className="text-[2rem] leading-[2.75rem]">Cart</h3>
            </div>
            <Table columns={["Item", "", "Quantity", "Price", "Total"]}>
                {items
                    ?.sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1))
                    .map((item: any) => (
                        <tr key={item.id} className="even:bg-content2">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 sm:pl-3">
                                <LocalizedClientLink className="flex sm:w-24 w-12" href={`/products/${item?.variant?.product.handle}`}>
                                    <Thumbnail size="square" thumbnail={item.thumbnail} />
                                </LocalizedClientLink>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <p className="font-medium text-default-800" data-testid="product-title">
                                    {item.title}
                                </p>
                                {item.variant.title && (
                                    <p className="inline-block text-default-600 w-full overflow-hidden text-ellipsis" data-testid="product-variant">
                                        Variant: {item.variant.title}
                                    </p>
                                )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <Control item={item} />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <LineItemUnitPrice item={item} region={region} style="tight" />
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                <span className="!pr-0">
                                    <LineItemPrice item={item} region={region} style="tight" />
                                </span>
                            </td>
                        </tr>
                    ))}
            </Table>
        </div>
    );
};

export default ItemsTemplate;
