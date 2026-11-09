import type React from "react";
import { useMemo, useState } from "react";
import { ShoppingCart, Minus, Plus, MessageCircle } from "lucide-react";
import type { Product, ProductVariant, CartItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { defaultVariant, handleWhatsAppPurchase, variantAttributes } from "@/lib/variant";
import { useConfig } from "@/providers/store-provider";
import { useCart } from "@/providers/cart-provider";
import { currency } from "@/utils";
import { Badge } from "@/components/ui/badge";

interface VariantSelectionProps {
    product: Product;
}

const matchesAttributes = (variant: ProductVariant, selected: Record<string, string>, optionNames: string[], except?: string) => {
    const attributes = variantAttributes(variant);
    return Object.entries(selected).every(([name, value]) => !optionNames.includes(name) || name === except || attributes[name] === value);
};

export const ProductVariantActions: React.FC<VariantSelectionProps> = ({ product }) => {
    const { cart, updateQuantity, addToCart } = useCart();
    const { whatsapp } = useConfig();
    const initialVariant = defaultVariant(product);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => initialVariant ? variantAttributes(initialVariant) : {});
    const [added, setAdded] = useState(false);
    const options = product.options ?? [];
    const optionNames = options.map((option) => option.name);
    const variants = product.variants ?? [];

    const selectedVariant = useMemo(() => {
        if (!options.length) return initialVariant;
        return variants.find((variant) => {
            const attributes = variantAttributes(variant);
            return options.every((option) => selectedAttributes[option.name] && attributes[option.name] === selectedAttributes[option.name]);
        }) ?? null;
    }, [initialVariant, options, selectedAttributes, variants]);

    const itemInCart = useMemo(
        () => selectedVariant ? cart?.items?.find((item: CartItem) => item.variant.id === selectedVariant.id) : undefined,
        [cart, selectedVariant],
    );
    const outOfStock = !selectedVariant || selectedVariant.inventory <= 0;

    const selectAttribute = (name: string, value: string) => {
        setSelectedAttributes((previous) => ({ ...previous, [name]: value }));
    };

    const onWhatsApp = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (selectedVariant && whatsapp) handleWhatsAppPurchase(selectedVariant, product.slug, whatsapp);
    };

    return (
        <div className="space-y-5">
            {options.map((option) => (
                <div key={option.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{option.name}</p>
                        <span className="text-xs text-muted-foreground">{selectedAttributes[option.name] ?? "Select an option"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                            const available = variants.some((variant) =>
                                variant.inventory > 0 &&
                                variantAttributes(variant)[option.name] === value &&
                                matchesAttributes(variant, selectedAttributes, optionNames, option.name),
                            );
                            const selected = selectedAttributes[option.name] === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    disabled={!available}
                                    onClick={() => selectAttribute(option.name, value)}
                                    aria-pressed={selected}
                                    className={cn(
                                        "min-w-12 rounded-lg border px-3 py-2 text-sm transition-colors",
                                        selected ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground",
                                        !available && "cursor-not-allowed opacity-35 line-through",
                                    )}
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {selectedVariant ? (
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">{options.length ? "Selected variant" : "Product"}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{Object.entries(variantAttributes(selectedVariant)).map(([name, value]) => `${name}: ${value}`).join(" · ") || `SKU: ${selectedVariant.sku}`}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-semibold">{currency(selectedVariant.price)}</p>
                            {!!selectedVariant.old_price && selectedVariant.old_price > selectedVariant.price && <p className="text-xs text-muted-foreground line-through">{currency(selectedVariant.old_price)}</p>}
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
