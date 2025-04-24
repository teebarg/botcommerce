"use client";

import LineItemPrice from "@modules/common/components/line-item-price";
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price";
import Image from "next/image";
import { currency } from "@lib/util/util";

import Thumbnail from "@/components/generic/thumbnail";
import Control from "@/components/store/cart/control";
import LocalizedClientLink from "@/components/ui/link";
import { CartItem } from "@/types/models";
import { useCartItem } from "@/lib/hooks/useCart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CartItems = () => {
    const { data: items, isLoading } = useCartItem();

    if (isLoading) return <div>Loading cart...</div>;
    if (!items?.length) return <div>No items in cart</div>;

    return (
        <div>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items?.map((item: CartItem, idx: number) => (
                            <TableRow key={idx} className="even:bg-content1">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                    <LocalizedClientLink className="flex sm:w-20 w-12" href={`/products/${item?.slug}`}>
                                        <Thumbnail size="square" thumbnail={item.image} />
                                    </LocalizedClientLink>
                                </TableCell>
                                <TableCell className="flex-1">
                                    <p className="font-medium text-default-900 truncate max-w-72" data-testid="product-title">
                                        {item.name}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <Control item={item} />
                                </TableCell>
                                <TableCell>
                                    <LineItemUnitPrice item={item} style="tight" />
                                </TableCell>
                                <TableCell className="flex justify-end">
                                    <LineItemPrice item={item} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="md:hidden">
                <div className="py-0">
                    <div className="space-y-4">
                        {items.map((item: CartItem, idx: number) => (
                            <div key={idx} className="flex items-center space-x-4 py-4 border-b">
                                <div className="w-20 h-20 object-cover rounded relative">
                                    <Image fill alt={item.name} src={item.image as string} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                                    <Control item={item} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-medium text-default-900 flex items-center">
                                        {item.quantity} @ {currency(item.price)}
                                    </span>
                                    <span className="text-xl font-medium">{currency(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItems;
