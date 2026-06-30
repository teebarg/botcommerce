import type React from "react";
import { cn, currency } from "@/utils";
import type { CartItem } from "@/schemas";
import { Minus, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChangeCartQuantity, useDeleteCartItem } from "@/hooks/useCart";
import ImageLightbox from "@/components/image-lightbox";

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
    const updateQuantity = useChangeCartQuantity();
    const deleteItem = useDeleteCartItem();
    const oos = item.variant?.status === "OUT_OF_STOCK";

    const onUpdateQuantity = async (id: number, quantity: number) => {
        await updateQuantity.mutateAsync({ item_id: id, quantity });
    };

    const removeItem = async (id: number) => {
        deleteItem.mutateAsync(id);
    };

    return (
        <div className={cn("flex items-center gap-3 px-2.5 py-2 border-b last:border-b-0 w-full min-w-0", oos && "bg-destructive/5")}>
            <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <ImageLightbox url={item?.image} alt={item.name} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex gap-1.5">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        oos && "text-muted-foreground line-through"
                    )}>
                        {item.name ?? "Product"}
                    </p>
                    {oos && (
                        <span className="text-2xs font-medium bg-destructive/10 text-destructive px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                            Out of stock
                        </span>
                    )}
                </div>
                {item.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {[
                            item.variant.size && `Size: ${item.variant.size}`,
                            item.variant.color && `Color: ${item.variant.color}`,
                            item.variant.width && `Width: ${item.variant.width}`,
                            item.variant.length && `Length: ${item.variant.length}`,
                            item.variant.age && `Age: ${item.variant.age}`,
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                )}
                {
                    !oos && (
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                disabled={updateQuantity.isPending || item.quantity <= 1}
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{updateQuantity.isPending ? "..." : item.quantity}</span>
                            <button
                                disabled={updateQuantity.isPending || Boolean(item.variant?.inventory && item.quantity >= item.variant.inventory)}
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )
                }
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
                <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity} × {currency(item.price)}
                </p>
                <Button disabled={deleteItem.isPending} isLoading={deleteItem.isPending} size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
};

export default CartItemComponent;
