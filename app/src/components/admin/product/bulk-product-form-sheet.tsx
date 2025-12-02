import { useState } from "react";
import { Tag, Settings } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollections } from "@/lib/hooks/useCollection";
import { useCategories } from "@/lib/hooks/useCategories";
import MultiSelect, { SelectOption } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { useBulkProductUpdate } from "@/lib/hooks/useGallery";
import { Checkbox } from "@/components/ui/checkbox";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { AgeRangeSelector } from "@/components/ui/age-selector";

type FormProduct = {
    categories: { value: number; label: string }[];
    collections: { value: number; label: string }[];
    active: boolean;
    size: string;
    color: string;
    age: string;
    measurement: number;
    price: number;
    old_price: number;
    inventory: number;
};

type FieldKey = keyof FormProduct;

const FIELD_CONFIG = {
    active: { label: "Show in Store", type: "boolean" },
    categories: { label: "Categories", type: "multiselect" },
    collections: { label: "Collections", type: "multiselect" },
    size: { label: "Size", type: "select" },
    color: { label: "Color", type: "select" },
    age: { label: "Age Range", type: "select" },
    measurement: { label: "Measurement", type: "number" },
    price: { label: "Price", type: "number" },
    old_price: { label: "Old Price", type: "number" },
    inventory: { label: "Inventory", type: "number" },
} as const;

interface BulkProductSheetFormProps {
    imageIds: number[];
    onClose: () => void;
}

export function BulkProductSheetForm({ onClose, imageIds }: BulkProductSheetFormProps) {
    const { mutateAsync: bulkProductUpdate, isPending } = useBulkProductUpdate();

    const [errors, setErrors] = useState<Partial<FormProduct>>({});
    const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(new Set());
    const { data: collections } = useCollections();
    const { data: categories } = useCategories();
    const [product, setProduct] = useState<FormProduct>({
        categories: [],
        collections: [],
        active: true,
        size: "",
        color: "",
        measurement: 0,
        age: "",
        price: 0,
        old_price: 0,
        inventory: 0,
    });

    const updateField = (field: keyof FormProduct, value: string | number | SelectOption[] | boolean) => {
        const updatedDetails = { ...product, [field]: value };

        setProduct((prev) => ({ ...prev, ...updatedDetails }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const toggleFieldSelection = (field: FieldKey) => {
        setSelectedFields((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(field)) {
                newSet.delete(field);
            } else {
                newSet.add(field);
            }

            return newSet;
        });
    };

    const selectAllFields = () => {
        setSelectedFields(new Set(Object.keys(FIELD_CONFIG) as FieldKey[]));
    };

    const deselectAllFields = () => {
        setSelectedFields(new Set());
    };

    const handleSubmit = () => {
        const input: any = {};

        if (selectedFields.has("categories")) {
            input.category_ids = product.categories?.map((c) => c.value) || [];
        }
        if (selectedFields.has("collections")) {
            input.collection_ids = product.collections?.map((c) => c.value) || [];
        }
        if (selectedFields.has("active")) {
            input.active = product.active;
        }
        if (selectedFields.has("size")) {
            input.size = product.size;
        }
        if (selectedFields.has("color")) {
            input.color = product.color;
        }
        if (selectedFields.has("age")) {
            input.age = product.age;
        }
        if (selectedFields.has("measurement")) {
            input.measurement = product.measurement;
        }
        if (selectedFields.has("price")) {
            input.price = product.price;
        }
        if (selectedFields.has("old_price")) {
            input.old_price = product.old_price;
        }
        if (selectedFields.has("inventory")) {
            input.inventory = product.inventory;
        }

        bulkProductUpdate({ imageIds, input }).then(() => onClose());
    };

    return (
        <div className="space-y-4 px-4 pt-4">
            <h2 className="text-xl font-semibold text-card-foreground">Bulk Product Details</h2>

            <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        <Label className="text-sm font-medium">Select Fields</Label>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            disabled={selectedFields.size === Object.keys(FIELD_CONFIG).length}
                            size="sm"
                            variant="outline"
                            onClick={selectAllFields}
                        >
                            Select All
                        </Button>
                        <Button disabled={selectedFields.size === 0} size="sm" variant="outline" onClick={deselectAllFields}>
                            Deselect All
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(FIELD_CONFIG).map(([field, config]) => (
                        <div key={field} className="flex items-center space-x-2">
                            <Checkbox
                                checked={selectedFields.has(field as FieldKey)}
                                id={field}
                                onCheckedChange={() => toggleFieldSelection(field as FieldKey)}
                            />
                            <Label className="text-sm" htmlFor={field}>
                                {config.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </Card>

            <Separator />

            <div className="grid gap-6">
                {selectedFields.has("active") && (
                    <div className="flex items-center gap-2">
                        <Checkbox checked={product.active} id="active" onCheckedChange={(checked) => updateField("active", checked)} />
                        <Label className="text-sm font-medium" htmlFor="active">
                            Show in Store
                        </Label>
                    </div>
                )}

                {(selectedFields.has("categories") || selectedFields.has("collections")) && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {selectedFields.has("categories") && (
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
                        )}

                        {selectedFields.has("collections") && (
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
                        )}
                    </div>
                )}
            </div>

            {(selectedFields.has("size") ||
                selectedFields.has("color") ||
                selectedFields.has("age") ||
                selectedFields.has("measurement") ||
                selectedFields.has("price") ||
                selectedFields.has("old_price") ||
                selectedFields.has("inventory")) && (
                <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                        {selectedFields.has("size") && (
                            <div className="space-y-2">
                                <Label className="text-sm">Size</Label>
                                <Select value={product.size.toString()} onValueChange={(value) => updateField("size", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SIZE_OPTIONS.map((size: string) => (
                                            <SelectItem key={size} value={size}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedFields.has("color") && (
                            <div className="space-y-2">
                                <Label className="text-sm">Color</Label>
                                <Select value={product.color.toString()} onValueChange={(value) => updateField("color", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLOR_OPTIONS.map((color: string) => (
                                            <SelectItem key={color} value={color}>
                                                {color}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedFields.has("age") && (
                            <div className="col-span-2">
                                <AgeRangeSelector selectedRange={product.age} onChange={(range) => updateField("age", range)} />
                            </div>
                        )}

                        {selectedFields.has("measurement") && (
                            <div className="space-y-2">
                                <Label className="text-sm">Measurement</Label>
                                <Input
                                    placeholder="Example: 41,42,43"
                                    type="number"
                                    value={product.measurement || ""}
                                    onChange={(e) => updateField("measurement", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        )}

                        {selectedFields.has("price") && (
                            <div className="space-y-2">
                                <Label className="text-sm" htmlFor="price">
                                    Price
                                </Label>
                                <Input
                                    id="price"
                                    placeholder="1200"
                                    step="1"
                                    type="number"
                                    value={product.price || ""}
                                    onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        )}

                        {selectedFields.has("old_price") && (
                            <div className="space-y-2">
                                <Label className="text-sm" htmlFor="old_price">
                                    Old Price
                                </Label>
                                <Input
                                    id="old_price"
                                    placeholder="0"
                                    step="1"
                                    type="number"
                                    value={product.old_price || ""}
                                    onChange={(e) => updateField("old_price", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        )}

                        {selectedFields.has("inventory") && (
                            <div className="space-y-2">
                                <Label className="text-sm" htmlFor="inventory">
                                    Inventory
                                </Label>
                                <Input
                                    id="inventory"
                                    min="0"
                                    placeholder="0"
                                    type="number"
                                    value={product.inventory}
                                    onChange={(e) => updateField("inventory", parseInt(e.target.value) || 0)}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <div className="flex justify-end gap-2 sticky bottom-0 bg-background -mx-4 py-4 px-4">
                <Button variant="destructive" onClick={onClose}>
                    Close
                </Button>
                <Button disabled={isPending || selectedFields.size === 0} isLoading={isPending} onClick={handleSubmit}>
                    {selectedFields.size === 0 ? "Select Fields First" : `Update ${selectedFields.size} Field${selectedFields.size !== 1 ? "s" : ""}`}
                </Button>
            </div>
        </div>
    );
}
