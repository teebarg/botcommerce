"use client";

import { Trash2 } from "lucide-react";

import { Spinner } from "@/components/generic/spinner";
import { CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useChangeCartQuantity, useDeleteCartItem } from "@/lib/hooks/useCart";

type ItemsTemplateProps = {
    item: CartItem;
};

const Control = ({ item }: ItemsTemplateProps) => {
    const updateQuantity = useChangeCartQuantity();
    const deleteItem = useDeleteCartItem();

    const isLoading = deleteItem.isPending || updateQuantity.isPending;

    const handleDelete = async (id: number) => {
        deleteItem.mutateAsync(id);
    };

    const onUpdateQuantity = async (id: number, quantity: number) => {
        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        updateQuantity.mutateAsync({ item_id: id, quantity });
    };

    return (
        <div className="w-28">
            <div className="flex gap-1 items-center">
                <div className="flex items-center border rounded-md">
                    <Button size="sm" variant="ghost" onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                        -
                    </Button>
                    <span className="px-1">{item.quantity}</span>
                    <Button size="sm" variant="ghost" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                        +
                    </Button>
                </div>
                <Button disabled={isLoading} size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-6 w-6 text-rose-500" />
                </Button>
                {isLoading && <Spinner key={item.id} />}
            </div>
        </div>
    );
};

export default Control;
