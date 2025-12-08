import type React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import type { CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useChangeCartQuantity, useDeleteCartItem } from "@/hooks/useCart";

interface Props {
    item: CartItem;
}

const CartControl: React.FC<Props> = ({ item }) => {
    const updateQuantity = useChangeCartQuantity();
    const deleteItem = useDeleteCartItem();

    const onUpdateQuantity = async (id: number, quantity: number) => {
        await updateQuantity.mutateAsync({ item_id: id, quantity });
    };

    const removeItem = async (id: number) => {
        deleteItem.mutateAsync(id);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center bg-background rounded-full overflow-hidden">
                <button
                    className="p-2 hover:bg-secondary transition-colors disabled:opacity-50"
                    disabled={item.quantity <= 1}
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                    <Minus className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="px-2 py-1.5 min-w-8 text-center">
                    <span className="text-xs font-medium text-foreground">{updateQuantity.isPending ? "..." : item.quantity}</span>
                </div>

                <button
                    className="p-2 hover:bg-secondary transition-colors disabled:opacity-50"
                    disabled={updateQuantity.isPending || (item.variant?.inventory && item.quantity >= item.variant.inventory)}
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>

            <Button disabled={deleteItem.isPending} isLoading={deleteItem.isPending} size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
        </div>
    );
};

export default CartControl;
