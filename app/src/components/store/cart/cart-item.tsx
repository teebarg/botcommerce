import type React from "react";
import { currency } from "@/utils";
import type { CartItem } from "@/schemas";
import { Minus, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageLightbox from "@/components/image-lightbox";
import { cn } from "@/utils/cn";
import { variantLabel } from "@/lib/variant";
import { useCart } from "@/providers/cart-provider";

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
    const { updateQuantity, isLoading, removeFromCart } = useCart();
    const oos = item.variant?.inventory <= 0;

    return (
        <div className={cn("flex items-center gap-3 px-2.5 py-2 border-b last:border-b-0 w-full min-w-0", oos && "bg-destructive/5")}>
            <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <ImageLightbox url={item?.image} alt={item.name} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex gap-1.5">
                    <p className={cn("text-sm font-medium truncate", oos && "text-muted-foreground line-through")}>{item.name ?? "Product"}</p>
                    {oos && (
                        <span className="text-2xs font-medium bg-destructive/10 text-destructive px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                            Out of stock
                        </span>
                    )}
                </div>
                {item.variant && <p className="text-xs text-muted-foreground mt-0.5 truncate">{variantLabel(item.variant)}</p>}
                {!oos && (
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            disabled={isLoading || item.quantity <= 1}
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                            disabled={isLoading || Boolean(item.variant?.inventory && item.quantity >= item.variant.inventory)}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
                <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity} × {currency(item.variant.price)}
                </p>
                <Button disabled={isLoading} size="icon" variant="ghost" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
};

export default CartItemComponent;
