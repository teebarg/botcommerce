import React, { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProductSearch, Shared } from "@/schemas";
import { useUpdateSharedCollection, useCreateSharedCollection } from "@/lib/hooks/useCollection";
import { currency } from "@/lib/utils";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import ProductSearchClient from "@/components/store/products/product-search";

interface SharedFormProps {
    current?: Shared;
    onClose?: () => void;
}

export const FormSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    products: z.array(z.number()),
    is_active: z.boolean(),
});

export type SharedFormValues = z.infer<typeof FormSchema>;

const ProductCard: React.FC<{ product: ProductSearch; removeProduct: (productId: number) => void }> = ({ product, removeProduct }) => {
    const { priceInfo } = useProductVariant(product);

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-content1 rounded-lg border border-border">
            <Image
                alt={product.name}
                className="object-contain rounded-lg"
                height={80}
                src={product.images[0] || product.image || "/placeholder.jpg"}
                width={80}
            />
            <div className="flex-1">
                <h5 className="font-medium">{product.name}</h5>
                <p className="text-lg text-default-700 font-semibold">{currency(priceInfo.minPrice)}</p>
            </div>
            <Button
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => removeProduct(product.id)}
            >
                <Trash2 className="h-6 w-6" />
            </Button>
        </div>
    );
};

export const SharedForm: React.FC<SharedFormProps> = ({ current, onClose }) => {
    const [products, setProducts] = useState<ProductSearch[]>(current?.products || []);
    const form = useForm<SharedFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: current?.title || "",
            description: current?.description || "",
            products: current?.products?.map((p) => p.id) || [],
            is_active: current?.is_active ?? true,
        } as any,
    });

    const createShared = useCreateSharedCollection();
    const updateShared = useUpdateSharedCollection();

    const isLoading = createShared.isPending || updateShared.isPending;

    const { handleSubmit, control, setValue, watch, formState } = form;
    const formProducts = watch("products");

    const onSubmit = async (values: SharedFormValues) => {
        if (current?.id) {
            updateShared.mutateAsync({ id: current?.id!, data: values });
        } else {
            createShared.mutateAsync(values).then(() => onClose?.());
        }
    };

    const addProduct = (product: ProductSearch) => {
        setProducts([...products, product]);
        setValue("products", [...formProducts, product.id]);
    };

    const removeProduct = (productId: number) => {
        setProducts(products.filter((p: ProductSearch) => p.id !== productId));
        setValue(
            "products",
            formProducts.filter((p: number) => p !== productId)
        );
    };

    return (
        <div className="px-4 pt-4 overflow-y-auto">
            <Form {...form}>
                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    <ProductSearchClient closeOnSelect={false} onProductSelect={addProduct} />
                    <Card className="border-0 bg-card/50 backdrop-blur-sm">
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Collection Title *</FormLabel>
                                            <FormControl>
                                                <Input {...field} required placeholder="My Amazing Collection" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Describe your collection and what makes it special..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                                            <div className="space-y-1">
                                                <FormLabel>Active Status</FormLabel>
                                                <p className="text-sm text-muted-foreground">Make this collection visible to others</p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <div className="max-h-[50vh] overflow-y-auto">
                        {products.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-foreground">Selected Products({products.length}):</h4>
                                <div className="grid gap-4">
                                    {products.map((product: ProductSearch, idx: number) => (
                                        <ProductCard key={idx} product={product} removeProduct={removeProduct} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 bottom-0 sticky z-10 bg-background py-2">
                        {onClose && (
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        )}
                        <Button disabled={isLoading || !form.watch("title")} isLoading={isLoading} type="submit" variant="primary">
                            <Save className="h-5 w-5 mr-1" />
                            {current ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
