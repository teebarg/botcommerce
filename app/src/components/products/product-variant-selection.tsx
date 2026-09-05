import type React from "react";
import { Minus, Plus } from "lucide-react";
import { currency } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { useProductVariant } from "@/hooks/useProductVariant";
import type { ProductLite, ProductVariantLite } from "@/schemas/product";
import { Button } from "@/components/ui/button";

interface VariantSelectionProps {
    product: ProductLite;
    selectedVariant?: ProductVariantLite;
}

export const ProductVariantSelection: React.FC<VariantSelectionProps> = ({ product, selectedVariant }) => {
    const { quantity, setQuantity } = useProductVariant(product);

    return (
        <div className="space-y-5">
            {selectedVariant && (
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium">Selected variant</p>
                            <p className="text-xs text-muted-foreground mt-0.5">SKU: {selectedVariant.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-semibold">{currency(selectedVariant.price)}</p>
                            {selectedVariant.old_price > 0 && (
                                <p className="text-xs text-muted-foreground line-through">{currency(selectedVariant.old_price)}</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <Badge variant={selectedVariant.inventory > 0 ? "success" : "destructive"}>
                            {selectedVariant.inventory > 0 ? "In stock" : "Out of stock"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{selectedVariant.inventory} available</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-foreground">Quantity</p>
                <div className="flex items-center gap-3 bg-secondary rounded-full p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="rounded-full hover:bg-background"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)} className="rounded-full hover:bg-background">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
