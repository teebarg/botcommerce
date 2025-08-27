import { useState } from "react";
import { Package, Tag } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollections } from "@/lib/hooks/useCollection";
import { useCategories } from "@/lib/hooks/useCategories";
import { useBrands } from "@/lib/hooks/useBrand";
import MultiSelect, { SelectOption } from "@/components/ui/multi-select";
import { Product, ProductVariant } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useCreateImageMetadata } from "@/lib/hooks/useProduct";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const COLOR_OPTIONS = ["Red", "Blue", "Green", "Black", "White"];

type FormProduct = Omit<Partial<Product>, "brand" | "images" | "variants" | "categories" | "collections"> & {
    brand?: number;
    categories: { value: number; label: string }[];
    collections: { value: number; label: string }[];
    variants: ProductVariant[];
};

interface ProductSheetFormProps {
    imageId: number;
    onClose: () => void;
}

export function ProductSheetForm({ onClose, imageId }: ProductSheetFormProps) {
    const { mutateAsync: createImageMetadata } = useCreateImageMetadata();
    const [errors, setErrors] = useState<Partial<FormProduct>>({});
    const { data: collections } = useCollections();
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();
    const [product, setProduct] = useState<FormProduct>({
        name: "",
        categories: [],
        collections: [],
        brand: 0,
        variants: [],
    });

    const updateField = (field: keyof FormProduct, value: string | number | SelectOption[]) => {
        const updatedDetails = { ...product, [field]: value };

        setProduct((prev) => ({ ...prev, ...updatedDetails }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
        size: "",
        color: "",
        price: 0,
        old_price: 0,
        inventory: 1,
    });

    const handleSubmit = () => {
        const input = { ...product, variants: [...product.variants, newVariant] };

        createImageMetadata({ imageId, input }).then(() => onClose());
    };

    return (
        <div className="space-y-6 px-4 py-8">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Product Details</h2>
                <p className="text-muted-foreground">Provide essential information about your product that customers will see.</p>
            </div>

            <div className="grid gap-6">
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
                            value={product.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                </Card>

                <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="p-4 bg-gradient-card shadow-soft">
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

                    <Card className="p-4 bg-gradient-card shadow-soft">
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

                    <Card className="p-4 bg-gradient-card shadow-soft">
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
                    </Card>
                </div>
            </div>
            <Card className="p-4">
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
                        <Select value={newVariant.color.toString()} onValueChange={(value) => setNewVariant((prev) => ({ ...prev, color: value }))}>
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
                            value={newVariant.inventory || "1"}
                            onChange={(e) => setNewVariant((prev) => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={onClose}>
                    Close
                </Button>
                <Button variant="indigo" onClick={handleSubmit}>
                    Save
                </Button>
            </div>
        </div>
    );
}
