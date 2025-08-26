import type { ProductVariant } from "./product-creator";

import { useState } from "react";
import { Plus, X, Palette, Ruler, Shirt, Package } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VariantCreationProps {
    variants: ProductVariant[];
    onVariantsChange: (variants: ProductVariant[]) => void;
}

const VARIANT_TYPES = [
    { value: "size", label: "Size", icon: Ruler, examples: ["XS", "S", "M", "L", "XL"] },
    { value: "color", label: "Color", icon: Palette, examples: ["Red", "Blue", "Green", "Black", "White"] },
    { value: "style", label: "Style", icon: Shirt, examples: ["Regular", "Slim", "Relaxed", "Classic"] },
] as const;

export function VariantCreation({ variants, onVariantsChange }: VariantCreationProps) {
    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
        type: "size",
        priceModifier: 0,
        stock: 0,
    });
    const [selectedType, setSelectedType] = useState<"size" | "color" | "style">("size");

    const addVariant = () => {
        if (!newVariant.name || !newVariant.value) return;

        const variant: ProductVariant = {
            id: Math.random().toString(36).substr(2, 9),
            name: newVariant.name,
            type: newVariant.type || "size",
            value: newVariant.value,
            priceModifier: newVariant.priceModifier || 0,
            stock: newVariant.stock || 0,
        };

        onVariantsChange([...variants, variant]);
        setNewVariant({
            type: selectedType,
            priceModifier: 0,
            stock: 0,
        });
    };

    const removeVariant = (variantId: string) => {
        onVariantsChange(variants.filter((v) => v.id !== variantId));
    };

    const updateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
        onVariantsChange(variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)));
    };

    const getVariantTypeIcon = (type: string) => {
        const variantType = VARIANT_TYPES.find((vt) => vt.value === type);

        return variantType ? variantType.icon : Package;
    };

    const quickAddExample = (example: string) => {
        setNewVariant((prev) => ({
            ...prev,
            name: example,
            value: example,
        }));
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

                    {/* Variant Type Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        {VARIANT_TYPES.map((type) => {
                            const Icon = type.icon;

                            return (
                                <button
                                    key={type.value}
                                    className={cn(
                                        "p-3 rounded-lg border text-sm font-medium transition-all duration-smooth",
                                        selectedType === type.value
                                            ? "bg-gradient-primary text-white shadow-soft"
                                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                    )}
                                    onClick={() => {
                                        setSelectedType(type.value);
                                        setNewVariant((prev) => ({ ...prev, type: type.value }));
                                    }}
                                >
                                    <Icon className="w-4 h-4 mx-auto mb-1" />
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Examples */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Quick add:</Label>
                        <div className="flex flex-wrap gap-2">
                            {VARIANT_TYPES.find((t) => t.value === selectedType)?.examples.map((example) => (
                                <Badge
                                    key={example}
                                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors duration-smooth"
                                    variant="outline"
                                    onClick={() => quickAddExample(example)}
                                >
                                    {example}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Variant Form */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="variant-name">
                                Display Name
                            </Label>
                            <Input
                                id="variant-name"
                                placeholder="e.g., Large"
                                value={newVariant.name || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="variant-value">
                                Value
                            </Label>
                            <Input
                                id="variant-value"
                                placeholder="e.g., L"
                                value={newVariant.value || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, value: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="price-modifier">
                                Price Change ($)
                            </Label>
                            <Input
                                id="price-modifier"
                                placeholder="0.00"
                                step="0.01"
                                type="number"
                                value={newVariant.priceModifier || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, priceModifier: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="stock">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                min="0"
                                placeholder="0"
                                type="number"
                                value={newVariant.stock || ""}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full bg-gradient-primary hover:shadow-medium transition-all duration-smooth"
                        disabled={!newVariant.name || !newVariant.value}
                        onClick={addVariant}
                    >
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
                            const Icon = getVariantTypeIcon(variant.type);

                            return (
                                <Card key={variant.id} className="p-4 bg-gradient-card shadow-soft">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-card-foreground">{variant.name}</h4>
                                                    <Badge className="text-xs" variant="secondary">
                                                        {variant.type}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>Value: {variant.value}</span>
                                                    {variant.priceModifier !== 0 && (
                                                        <span className={cn(variant.priceModifier > 0 ? "text-success" : "text-warning")}>
                                                            {variant.priceModifier > 0 ? "+" : ""}${variant.priceModifier.toFixed(2)}
                                                        </span>
                                                    )}
                                                    <span>Stock: {variant.stock}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <Input
                                                    className="w-20 h-8 text-xs"
                                                    placeholder="Price"
                                                    step="0.01"
                                                    type="number"
                                                    value={variant.priceModifier}
                                                    onChange={(e) => updateVariant(variant.id, "priceModifier", parseFloat(e.target.value) || 0)}
                                                />
                                                <Input
                                                    className="w-16 h-8 text-xs"
                                                    min="0"
                                                    placeholder="Stock"
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value) || 0)}
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
