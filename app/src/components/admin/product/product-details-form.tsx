import type { FormProduct } from "./product-creator";

import { useState } from "react";
import { Package, Tag, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCollections } from "@/hooks/useCollection";
import { useCategories } from "@/hooks/useCategories";
import MultiSelect, { SelectOption } from "@/components/ui/multi-select";

interface ProductDetailsFormProps {
    product: FormProduct;
    onDetailsChange: (details: FormProduct) => void;
}

export function ProductDetailsForm({ product, onDetailsChange }: ProductDetailsFormProps) {
    const [errors, setErrors] = useState<Partial<FormProduct>>({});
    const { data: collections } = useCollections();
    const { data: categories } = useCategories();

    const updateField = (field: keyof FormProduct, value: string | number | SelectOption[]) => {
        const updatedDetails = { ...product, [field]: value };

        onDetailsChange(updatedDetails);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Product Details</h2>
                <p className="text-muted-foreground">Provide essential information about your product that customers will see.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-4 bg-card shadow-sm">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2" htmlFor="name">
                            <Package className="w-4 h-4 text-primary" />
                            Product Name
                        </Label>
                        <Input
                            className={errors.name ? "border-destructive" : ""}
                            id="name"
                            placeholder="Enter product name"
                            value={product.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                </Card>

                <Card className="p-4 bg-card shadow-sm">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2" htmlFor="description">
                            <FileText className="w-4 h-4 text-primary" />
                            Description
                        </Label>
                        <Textarea
                            className="min-h-[100px] resize-none"
                            id="description"
                            placeholder="Describe your product, benefits, and specifications..."
                            value={product.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Help customers understand what makes your product special</span>
                            <span>{product.description?.length || 0}/500</span>
                        </div>
                    </div>
                </Card>

                <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="p-4 bg-card shadow-sm">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                Categories
                            </Label>
                            <MultiSelect
                                name="categories"
                                options={categories?.map((category) => ({ value: category.id, label: category.name }))}
                                value={product.categories}
                                onChange={(value) => updateField("categories", value)}
                            />
                        </div>
                    </Card>

                    <Card className="p-4 bg-card shadow-sm">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                Collection
                            </Label>
                            <MultiSelect
                                name="collections"
                                options={collections?.map((collection) => ({ value: collection.id, label: collection.name }))}
                                value={product.collections}
                                onChange={(value) => updateField("collections", value)}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
