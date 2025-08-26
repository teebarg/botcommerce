import { useState } from "react";
import { Plus, X, Palette, Package } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, currency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductVariant } from "@/schemas";

interface VariantCreationProps {
    variants: ProductVariant[];
    onVariantsChange: (variants: ProductVariant[]) => void;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const COLOR_OPTIONS = ["Red", "Blue", "Green", "Black", "White"];

export function VariantCreation({ variants, onVariantsChange }: VariantCreationProps) {
    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
        size: "",
        color: "",
        price: 0,
        old_price: 0,
        inventory: 0,
    });

    const addVariant = () => {
        const variant: ProductVariant = {
            id: Math.random().toString(36).substr(2, 9),
            price: newVariant.price || 0,
            old_price: newVariant.old_price || 0,
            inventory: newVariant.inventory || 0,
            size: newVariant.size || "",
            color: newVariant.color || "",
        };

        onVariantsChange([...variants, variant]);
        setNewVariant({
            price: 1,
            old_price: 0,
            inventory: 0,
            size: "",
            color: "",
        });
    };

    const removeVariant = (variantId: string) => {
        onVariantsChange(variants.filter((v) => v.id !== variantId));
    };

    const updateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
        onVariantsChange(variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Product Variants</h2>
                <p className="text-muted-foreground">Add different options for your product like sizes, colors, or styles. This step is optional.</p>
            </div>

            {/* Add New Variant */}
            <Card className="p-4 bg-gradient-card shadow-soft">
                <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        Add New Variant
                    </Label>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Size</Label>
                            <Select value={newVariant.size.toString()} onValueChange={(value) => setNewVariant((prev) => ({ ...prev, size: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Color</Label>
                            <Select
                                value={newVariant.color.toString()}
                                onValueChange={(value) => setNewVariant((prev) => ({ ...prev, color: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COLOR_OPTIONS.map((color) => (
                                        <SelectItem key={color} value={color}>
                                            {color}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="price">
                                Price
                            </Label>
                            <Input
                                id="price"
                                placeholder="1200"
                                step="1"
                                type="number"
                                value={newVariant.price || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="old_price">
                                Old Price
                            </Label>
                            <Input
                                id="old_price"
                                placeholder="0"
                                step="1"
                                type="number"
                                value={newVariant.old_price || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, old_price: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="inventory">
                                Stock
                            </Label>
                            <Input
                                id="inventory"
                                min="0"
                                placeholder="0"
                                type="number"
                                value={newVariant.inventory || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>

                    <Button className="w-full" disabled={newVariant.price < 2} variant="indigo" onClick={addVariant}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variant
                    </Button>
                </div>
            </Card>

            {/* Existing Variants */}
            {variants.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-lg font-medium text-card-foreground">Created Variants ({variants.length})</Label>
                    <div className="space-y-3">
                        {variants.map((variant) => {
                            return (
                                <Card key={variant.id} className="p-4 bg-gradient-card shadow-soft">
                                    <div className="flex md:items-center md:flex-row flex-col justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Palette className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {variant.size && (
                                                        <Badge className="text-xs" variant="primary">
                                                            {variant.size}
                                                        </Badge>
                                                    )}
                                                    {variant.color && (
                                                        <Badge className="text-xs" variant="secondary">
                                                            {variant.color}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{currency(variant.price)}</span>
                                                    {variant.old_price !== 0 && (
                                                        <span
                                                            className={cn(
                                                                variant.old_price > variant.price ? "text-success" : "text-warning",
                                                                "text-xs"
                                                            )}
                                                        >
                                                            {variant.old_price > variant.price ? "-" : ""}
                                                            {currency(variant.old_price)}
                                                        </span>
                                                    )}
                                                    <span>Stock: {variant.inventory}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <Input
                                                    className="w-20 h-8 text-xs"
                                                    placeholder="Price"
                                                    step="1"
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(variant.id, "price", parseFloat(e.target.value) || 0)}
                                                />
                                                <Input
                                                    className="w-20 h-8 text-xs"
                                                    placeholder="Old Price"
                                                    step="1"
                                                    type="number"
                                                    value={variant.old_price}
                                                    onChange={(e) => updateVariant(variant.id, "old_price", parseFloat(e.target.value) || 0)}
                                                />
                                                <Input
                                                    className="w-16 h-8 text-xs"
                                                    min="0"
                                                    placeholder="Stock"
                                                    type="number"
                                                    value={variant.inventory}
                                                    onChange={(e) => updateVariant(variant.id, "inventory", parseInt(e.target.value) || 0)}
                                                />
                                            </div>

                                            <Button
                                                className="w-8 h-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeVariant(variant.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {variants.length === 0 && (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No variants created yet</p>
                    <p className="text-sm text-muted-foreground">Variants help customers choose the right option for them</p>
                </div>
            )}
        </div>
    );
}
