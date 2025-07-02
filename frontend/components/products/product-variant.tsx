"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

import ProductVariantForm from "./product-variant-form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductVariant } from "@/schemas";
import { currency } from "@/lib/utils";
import { useDeleteVariant } from "@/lib/hooks/useProduct";

interface ProductVariantsProps {
    variants: ProductVariant[];
    productId: number;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ productId, variants = [] }) => {
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const deleteVariantMutation = useDeleteVariant();

    const handleEdit = (variant: ProductVariant) => {
        setEditingVariant(variant);
    };

    const deleteVariant = (id: number) => {
        deleteVariantMutation.mutate(id);
    };

    return (
        <div>
            <h4 className="text-lg font-medium text-default-800 mt-4">Product Variants</h4>
            <div className="py-4 rounded-md">
                <div className="max-h-[250px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                {["SKU", "Price", "Inventory", "Size", "Color", "Status", "Actions"]?.map((variant: string, idx: number) => (
                                    <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-default-500 uppercase tracking-wider">
                                        {variant}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {variants?.map((variant: ProductVariant, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">
                                        <p className="max-w-32 overflow-hidden text-ellipsis">{variant.sku}</p>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{currency(variant.price)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.inventory}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.size || "-"}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.color || "-"}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">
                                        <Badge variant={variant.status === "IN_STOCK" ? "emerald" : "destructive"}>{variant.status}</Badge>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium flex items-center">
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit(variant)}>
                                            <Edit className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => deleteVariant(variant.id)}>
                                            <Trash2 className="h-5 w-5 text-danger" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {variants.length === 0 && (
                                <tr>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500 text-center" colSpan={8}>
                                        No variants found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <ProductVariantForm productId={productId} variant={editingVariant} onCancel={() => setEditingVariant(null)} />
            </div>
        </div>
    );
};

export default ProductVariants;
