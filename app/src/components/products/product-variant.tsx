import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import ProductVariantForm from "./product-variant-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductVariant } from "@/schemas";
import { cn, currency } from "@/lib/utils";
import { useDeleteVariant, useUpdateVariant } from "@/hooks/useProduct";

interface ProductVariantsProps {
    variants: ProductVariant[];
    productId: number;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ productId, variants = [] }) => {
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const deleteVariantMutation = useDeleteVariant();
    const updateVariantMutation = useUpdateVariant();

    const handleEdit = (variant: ProductVariant) => {
        setEditingVariant(variant);
    };

    const deleteVariant = (id: number) => {
        deleteVariantMutation.mutate(id);
    };

    const markOutOfStock = (variant: ProductVariant) => {
        if (!variant?.id) return;
        updateVariantMutation.mutate({ id: variant.id, inventory: 0 });
    };

    return (
        <div>
            <h4 className="text-lg font-medium mt-4">Product Variants</h4>
            <div className="py-4 rounded-md">
                <div className="space-y-2">
                    {variants?.map((variant: ProductVariant, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 rounded-md p-2 bg-secondary">
                            <p className="text-sm font-medium">Sku: {variant.sku}</p>
                            <p className="text-sm font-medium">Price: {currency(variant.price)}</p>
                            <p className={cn("text-sm font-medium", variant.size ? "" : "hidden")}>Size: {variant.size}</p>
                            <p className={cn("text-sm font-medium", variant.color ? "" : "hidden")}>Color: {variant.color}</p>
                            <p className={cn("text-sm font-medium ", variant.measurement ? "" : "hidden")}>Measurement: {variant.measurement}</p>
                            <p className={cn("text-sm font-medium ", variant.age ? "" : "hidden")}>Age: {variant.age}</p>
                            <p className="text-sm font-medium">Inventory: {variant.inventory}</p>
                            <p className="text-sm font-medium">
                                <Badge variant={variant.status === "IN_STOCK" ? "emerald" : "destructive"}>{variant.status}</Badge>
                            </p>
                            <div className="flex gap-2 justify-end">
                                {variant.status === "IN_STOCK" && (
                                    <Button className="min-w-28" size="sm" variant="warning" onClick={() => markOutOfStock(variant)}>
                                        Mark out of stock
                                    </Button>
                                )}
                                <Button size="icon" variant="ghost" onClick={() => handleEdit(variant)}>
                                    <Edit className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => deleteVariant(variant.id)}>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {variants.length === 0 && (
                        <div>
                            <p className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground text-center">No variants found</p>
                        </div>
                    )}
                </div>
                <ProductVariantForm productId={productId} variant={editingVariant} onCancel={() => setEditingVariant(null)} />
            </div>
        </div>
    );
};

export default ProductVariants;
