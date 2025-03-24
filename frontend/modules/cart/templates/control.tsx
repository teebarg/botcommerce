"use client";

import { useState } from "react";
import { Spinner } from "@components/spinner";
import { toast } from "sonner";
import { Trash } from "nui-react-icons";

import { CartItem } from "@/lib/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";

type ItemsTemplateProps = {
    item: CartItem;
};

const Control = ({ item }: ItemsTemplateProps) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
            await api.cart.delete(id);
        } catch (error) {
            toast.error(`Error deleting item: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id: number, quantity: number) => {
        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        setLoading(true);
        try {
            const response = await api.cart.changeQuantity({
                item_id: id,
                quantity,
            });

            if (response.error) {
                toast.error(response.error);

                return;
            }

            toast.success("Cart updated successfully");
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-28">
            <div className="flex gap-1 items-center">
                <div className="flex items-center border rounded-md">
                    <Button size="sm" variant="ghost" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                        -
                    </Button>
                    <span className="px-1">{item.quantity}</span>
                    <Button size="sm" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        +
                    </Button>
                </div>
                <Button disabled={loading} size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    <Trash className="h-6 w-6 text-rose-500" />
                </Button>
                {loading && <Spinner key={item.id} />}
            </div>
        </div>
    );
};

export default Control;
