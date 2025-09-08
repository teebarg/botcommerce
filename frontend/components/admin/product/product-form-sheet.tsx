import { useState } from "react";
import { FileText, Package, Tag } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollections } from "@/lib/hooks/useCollection";
import { useCategories } from "@/lib/hooks/useCategories";
import MultiSelect, { SelectOption } from "@/components/ui/multi-select";
import { Product, ProductVariant } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useCreateImageMetadata, useUpdateImageMetadata } from "@/lib/hooks/useProduct";
import { Textarea } from "@/components/ui/textarea";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

type FormProduct = Omit<Partial<Product>, "images" | "variants" | "categories" | "collections"> & {
    categories: { value: number; label: string }[];
    collections: { value: number; label: string }[];
    variants: ProductVariant[];
};

interface ProductSheetFormProps {
    imageId: number;
    onClose: () => void;
    currentProduct?: Product;
}

export function ProductSheetForm({ onClose, imageId, currentProduct }: ProductSheetFormProps) {
    const { mutateAsync: createImageMetadata, isPending: createPending } = useCreateImageMetadata();
    const { mutateAsync: updateImageMetadata, isPending: updatePending } = useUpdateImageMetadata();

    const isPending = createPending || updatePending;
    const [errors, setErrors] = useState<Partial<FormProduct>>({});
    const { data: collections } = useCollections();
    const { data: categories } = useCategories();
    const [product, setProduct] = useState<FormProduct>({
        name: currentProduct?.name ?? "",
        description: currentProduct?.description ?? "",
        categories: currentProduct?.categories?.map((c) => ({ value: c.id, label: c.name })) ?? [],
        collections: currentProduct?.collections?.map((c) => ({ value: c.id, label: c.name })) ?? [],
        active: currentProduct?.active ?? true,
        variants: currentProduct?.variants ?? [],
    });

    const updateField = (field: keyof FormProduct, value: string | number | SelectOption[] | boolean) => {
        const updatedDetails = { ...product, [field]: value };

        setProduct((prev) => ({ ...prev, ...updatedDetails }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
        id: currentProduct?.variants?.[0]?.id ?? undefined,
        size: currentProduct?.variants?.[0]?.size ?? "",
        color: currentProduct?.variants?.[0]?.color ?? "",
        measurement: currentProduct?.variants?.[0]?.measurement ?? undefined,
        price: currentProduct?.variants?.[0]?.price ?? 0,
        old_price: currentProduct?.variants?.[0]?.old_price ?? 0,
        inventory: currentProduct?.variants?.[0]?.inventory ?? 0,
    });

    const isDisabled = newVariant.price < 2;

    const handleSubmit = () => {
        const input: any = {
            name: product.name,
            description: product.description,
            category_ids: product.categories?.map((c) => c.value) || [],
            collection_ids: product.collections?.map((c) => c.value) || [],
            active: product.active,
            variants: [newVariant],
        };

        if (currentProduct) {
            updateImageMetadata({ imageId, input }).then(() => onClose());
        } else {
            createImageMetadata({ imageId, input }).then(() => onClose());
        }
    };

    return (
        <div className="space-y-4 px-4 pt-8 overflow-y-auto">
            <div>
                <h2 className="text-xl font-semibold text-card-foreground">Product Details</h2>
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
                            placeholder="Describe your product features, benefits, and specifications..."
                            value={product.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Help customers understand what makes your product special</span>
                            <span>{product.description?.length || 0}/500</span>
                        </div>
                    </div>
                </Card>

                <div className="flex items-center gap-2">
                    <Checkbox checked={product.active} id="active" onCheckedChange={(checked) => updateField("active", checked)} />
                    <Label className="text-sm font-medium" htmlFor="active">
                        Show in Store
                    </Label>
                </div>

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

                    {/* <Card className="p-4 bg-card shadow-sm">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                Brand
                            </Label>
                            <Select value={product.brand?.toString()} onValueChange={(value) => updateField("brand", Number(value))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands?.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card> */}
                </div>
            </div>
            <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm">Size</Label>
                        <Select value={newVariant.size.toString()} onValueChange={(value) => setNewVariant((prev) => ({ ...prev, size: value }))}>
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

                    <div className="space-y-2">
                        <Label className="text-sm">Color</Label>
                        <Select value={newVariant.color.toString()} onValueChange={(value) => setNewVariant((prev) => ({ ...prev, color: value }))}>
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

                    <div className="space-y-2">
                        <Label className="text-sm">Measurement</Label>
                        <Input
                            type="number"
                            value={newVariant.measurement || ""}
                            onChange={(e) => setNewVariant((prev) => ({ ...prev, measurement: parseFloat(e.target.value) || undefined }))}
                        />
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
                            Inventory
                        </Label>
                        <Input
                            id="inventory"
                            min="0"
                            placeholder="0"
                            type="number"
                            value={newVariant.inventory}
                            onChange={(e) => setNewVariant((prev) => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-2 sticky bottom-0 bg-background -mx-4 py-4 px-4">
                <Button variant="destructive" onClick={onClose}>
                    Close
                </Button>
                <Button disabled={isDisabled} isLoading={isPending} variant="indigo" onClick={handleSubmit}>
                    Save
                </Button>
            </div>
        </div>
    );
}
