import type { ProductDetails } from "./product-creator";

import { useState } from "react";
import { Package, DollarSign, Tag, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsFormProps {
    details: ProductDetails;
    onDetailsChange: (details: ProductDetails) => void;
}

const CATEGORIES = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports & Outdoors",
    "Books",
    "Beauty & Personal Care",
    "Toys & Games",
    "Food & Beverages",
    "Health",
    "Automotive",
    "Art & Crafts",
    "Jewelry",
];

export function ProductDetailsForm({ details, onDetailsChange }: ProductDetailsFormProps) {
    const [errors, setErrors] = useState<Partial<ProductDetails>>({});

    const updateField = (field: keyof ProductDetails, value: string | number) => {
        const updatedDetails = { ...details, [field]: value };

        onDetailsChange(updatedDetails);

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const generateSKU = () => {
        const prefix = details.category ? details.category.substring(0, 3).toUpperCase() : "PRD";
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();

        updateField("sku", `${prefix}-${random}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Product Details</h2>
                <p className="text-muted-foreground">Provide essential information about your product that customers will see.</p>
            </div>

            <div className="grid gap-6">
                {/* Product Name */}
                <Card className="p-4 bg-gradient-card shadow-soft">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2" htmlFor="name">
                            <Package className="w-4 h-4 text-primary" />
                            Product Name
                        </Label>
                        <Input
                            className={errors.name ? "border-destructive" : ""}
                            id="name"
                            placeholder="Enter product name"
                            value={details.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                </Card>

                {/* Description */}
                <Card className="p-4 bg-gradient-card shadow-soft">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2" htmlFor="description">
                            <FileText className="w-4 h-4 text-primary" />
                            Description
                        </Label>
                        <Textarea
                            className="min-h-[100px] resize-none"
                            id="description"
                            placeholder="Describe your product features, benefits, and specifications..."
                            value={details.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Help customers understand what makes your product special</span>
                            <span>{details.description.length}/500</span>
                        </div>
                    </div>
                </Card>

                {/* Price and Category */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2" htmlFor="price">
                                <DollarSign className="w-4 h-4 text-primary" />
                                Price
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    className="pl-8"
                                    id="price"
                                    min="0"
                                    placeholder="0.00"
                                    step="0.01"
                                    type="number"
                                    value={details.price || ""}
                                    onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-card shadow-soft">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                Category
                            </Label>
                            <Select value={details.category} onValueChange={(value) => updateField("category", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>
                </div>

                {/* SKU */}
                <Card className="p-4 bg-gradient-card shadow-soft">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2 justify-between" htmlFor="sku">
                            <span className="flex items-center gap-2">
                                <Badge className="text-xs" variant="outline">
                                    SKU
                                </Badge>
                                Stock Keeping Unit
                            </span>
                            <button className="text-xs text-primary hover:underline" type="button" onClick={generateSKU}>
                                Generate
                            </button>
                        </Label>
                        <Input
                            className="font-mono text-sm"
                            id="sku"
                            placeholder="PRD-ABC123"
                            value={details.sku}
                            onChange={(e) => updateField("sku", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Unique identifier for inventory tracking</p>
                    </div>
                </Card>

                {/* Preview Card */}
                {(details.name || details.description || details.price) && (
                    <Card className="p-4 bg-accent/30 border border-primary/20">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-primary">Preview</Label>
                            <div className="space-y-1">
                                {details.name && <h3 className="font-semibold text-card-foreground">{details.name}</h3>}
                                {details.price > 0 && <p className="text-lg font-bold text-primary">${details.price.toFixed(2)}</p>}
                                {details.category && (
                                    <Badge className="text-xs" variant="secondary">
                                        {details.category}
                                    </Badge>
                                )}
                                {details.description && <p className="text-sm text-muted-foreground line-clamp-2">{details.description}</p>}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
