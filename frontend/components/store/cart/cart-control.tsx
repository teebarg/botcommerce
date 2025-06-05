import React, { useState, useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CartItem } from "@/types/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { useInvalidateCart, useInvalidateCartItem } from "@/lib/hooks/useCart";

interface Props {
    item: CartItem;
}

const CartControl: React.FC<Props> = ({ item }) => {
    const invalidateCart = useInvalidateCart();
    const invalidateCartItems = useInvalidateCartItem();
    const [mounted, setMounted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const updateQuantity = async (id: number, quantity: number) => {
        // if (!isInStock) {
        //     toast.error("Product out of stock")
        //     return;
        // }

        setUpdating(true);
        const response = await api.cart.changeQuantity({
            item_id: id,
            quantity,
        });

        if (response.error) {
            toast.error(response.error);

            return;
        }

        toast.success("Added to cart successfully");
        invalidateCart();
        invalidateCartItems();
        setUpdating(false);
    };

    const removeItem = async (id: number) => {
        setLoading(true);
        const response = await api.cart.delete(id);

        if (response.error) {
            toast.error(response.error);

            return;
        }

        toast.success("Item removed from cart successfully");
        invalidateCart();
        invalidateCartItems();
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center bg-background rounded-full border border-default-100 overflow-hidden">
                <button
                    className="p-2 hover:bg-default-100 transition-colors disabled:opacity-50"
                    disabled={item.quantity <= 1}
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                    <Minus className="h-4 w-4 text-default-600" />
                </button>

                <div className="px-2 py-1.5 min-w-[2rem] text-center">
                    <span className="text-xs font-medium text-default-900">{updating ? "..." : item.quantity}</span>
                </div>

                <button
                    className="p-2 hover:bg-default-100 transition-colors disabled:opacity-50"
                    disabled={updating}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                    <Plus className="h-4 w-4 text-default-600" />
                </button>
            </div>

            <Button disabled={loading} isLoading={loading} onClick={() => removeItem(item.id)} variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
        </div>
    );
};

export default CartControl;
