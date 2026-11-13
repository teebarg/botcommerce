import type React from "react";
import { useMemo, useState } from "react";
import { ShoppingCart, Minus, Plus, MessageCircle } from "lucide-react";
import type { Product, CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { defaultVariant, handleWhatsAppPurchase, variantAttributes } from "@/lib/variant";
import { useConfig } from "@/providers/store-provider";
import { useCart } from "@/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { VariantPicker, useVariantSelection } from "./variant-picker";
import { PriceLabel } from "../store/price-label";

interface VariantSelectionProps {
    product: Product;
}

export const ProductVariantActions: React.FC<VariantSelectionProps> = ({ product }) => {
    const { cart, updateQuantity, addToCart } = useCart();
    const { whatsapp } = useConfig();
    const initialVariant = defaultVariant(product);
    const { options, variants, selected: selectedAttributes, select: selectAttribute, selectedVariant } = useVariantSelection(product, initialVariant);
    const [added, setAdded] = useState(false);

    const itemInCart = useMemo(
        () => selectedVariant ? cart?.items?.find((item: CartItem) => item.variant.id === selectedVariant.id) : undefined,
        [cart, selectedVariant],
    );
    const outOfStock = !selectedVariant || selectedVariant.inventory <= 0;

    const onWhatsApp = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (selectedVariant && whatsapp) handleWhatsAppPurchase(selectedVariant, product.slug, whatsapp);
    };

    return (
        <div className="space-y-5">
            <VariantPicker options={options} variants={variants} selected={selectedAttributes} onSelect={selectAttribute} />

            {selectedVariant ? (
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">{options.length ? "Selected variant" : "Product"}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{Object.entries(variantAttributes(selectedVariant)).map(([name, value]) => `${name}: ${value}`).join(" · ") || `SKU: ${selectedVariant.sku}`}</p>
                        </div>
                        <div className="text-right">
                            <PriceLabel variant={selectedVariant} tone="dark" size="lg" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <Badge variant={selectedVariant.inventory > 0 ? "success" : "destructive"}>{selectedVariant.inventory > 0 ? "In stock" : "Out of stock"}</Badge>
                        <span className="text-xs text-muted-foreground">{selectedVariant.inventory} available</span>
                    </div>
                </div>
            ) : (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">Select an available combination to see its price and stock.</p>
            )}

            {itemInCart?.id && selectedVariant && (
                <div className="flex items-center gap-4">
                    <p className="text-sm font-medium">Quantity</p>
                    <div className="flex items-center gap-3 rounded-full bg-secondary p-1">
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-background" onClick={() => updateQuantity(itemInCart.id, Math.max(1, itemInCart.quantity - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="w-6 text-center text-sm font-medium">{itemInCart.quantity}</span>
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-background" onClick={() => updateQuantity(itemInCart.id, Math.min(selectedVariant.inventory, itemInCart.quantity + 1))}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <Button className="h-12 w-12 shrink-0 rounded-xl" disabled={outOfStock} size="icon" variant="outline" onClick={onWhatsApp} aria-label="Order through WhatsApp">
                    <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                    onClick={(event) => {
                        event.preventDefault();
                        if (!selectedVariant || outOfStock) return;
                        addToCart(selectedVariant.id, 1);
                        setAdded(true);
                        window.setTimeout(() => setAdded(false), 1600);
                    }}
                    disabled={outOfStock}
                    className={cn("h-12 flex-1 rounded-xl px-6", added ? "bg-success text-success-foreground" : "bg-foreground text-background hover:opacity-90")}
                    variant="outline"
                    size="lg"
                >
                    {outOfStock ? "Unavailable" : added ? "Added to cart" : <><ShoppingCart className="h-4 w-4" />Add to cart</>}
                </Button>
            </div>
        </div>
    );
};
