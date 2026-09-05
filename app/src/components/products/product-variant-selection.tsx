import type React from "react";
import { Minus, Plus } from "lucide-react";
import { currency } from "@/utils";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductVariant } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useCart } from "@/providers/cart-provider";
import { useMemo } from "react";
import { CartItem } from "@/schemas";

interface VariantSelectionProps {
    product: Product;
    variant?: ProductVariant;
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, variant }) => {
    const { cart, updateQuantity } = useCart();
    const itemInCart = useMemo(
        () => cart?.items?.find((item: CartItem) => item.variant.sku === product.variants?.[0]?.sku),
        [product.variants?.[0]?.sku, cart]
    );

    return (
        <div className="space-y-5">
            {variant && (
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium">Selected variant</p>
                            <p className="text-xs text-muted-foreground mt-0.5">SKU: {variant.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-semibold">{currency(variant.price)}</p>
                            {variant.old_price > 0 && <p className="text-xs text-muted-foreground line-through">{currency(variant.old_price)}</p>}
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <Badge variant={variant.inventory > 0 ? "success" : "destructive"}>
                            {variant.inventory > 0 ? "In stock" : "Out of stock"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{variant.inventory} available</span>
                    </div>
                </div>
            )}
            {itemInCart?.id && variant && (
                <div className={cn("items-center gap-4", product.in_stock && itemInCart?.id ? "flex" : "hidden")}>
                    <p className="text-sm font-medium text-foreground">Quantity</p>
                    <div className="flex items-center gap-3 bg-secondary rounded-full p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(itemInCart?.id, Math.max(1, itemInCart?.quantity - 1))}
                            className="rounded-full hover:bg-background"
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{itemInCart.quantity}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(itemInCart?.id, Math.min(variant?.inventory, itemInCart?.quantity + 1))}
                            className="rounded-full hover:bg-background"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
