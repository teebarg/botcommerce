"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/multi-select";
import { Brand, Category, Collection, Product } from "@/schemas/product";
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/useProduct";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Product name must be at least 2 characters.",
    }),
    description: z.string(),
    categories: z.array(z.any()),
    collections: z.array(z.any()),
    brand: z.number(),
    status: z.string().min(3, {
        message: "Status must be at least 3 characters.",
    }),
});

interface ProductFormProps {
    product?: Product;
    onClose: () => void;
    collections: Collection[];
    categories: Category[];
    brands: Brand[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, collections, categories, brands }) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            status: product?.status || "IN_STOCK",
            brand: product?.brand?.id || 1,
            categories: product?.categories?.map((category: Category) => ({ value: category.id, label: category.name })) || [],
            collections: product?.collections?.map((collection: Collection) => ({ value: collection.id, label: collection.name })) || [],
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { brand, categories, collections, ...data } = values;
        const categoryIds = categories.map((category) => category.value);
        const collectionIds = collections.map((collection) => collection.value);

        setIsPending(true);
        try {
            if (product?.id) {
                await updateProduct.mutateAsync({
                    id: product.id,
                    input: {
                        ...data,
                        category_ids: categoryIds,
                        collection_ids: collectionIds,
                        brand_id: brand,
                    },
                });
            } else {
                await createProduct.mutateAsync({
                    ...data,
                    category_ids: categoryIds,
                    collection_ids: collectionIds,
                    brand_id: brand,
                });
            }
            if (!product?.id) {
                onClose?.();
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="overflow-y-auto flex flex-col pb-4">
            <Form {...form}>
                <form className="space-y-6 h-full flex-1" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="w-full h-full">
                        {/* Product Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select defaultValue={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IN_STOCK">In Stock</SelectItem>
                                                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea rows={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categories"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Categories</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                name={field.name}
                                                options={categories.map((category) => ({ value: category.id, label: category.name }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="collections"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Collections</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                name={field.name}
                                                options={collections?.map((collection) => ({ value: collection.id, label: collection.name }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Brand</FormLabel>
                                        <FormControl>
                                            <Select defaultValue={field.value.toString()} onValueChange={(e) => field.onChange(Number(e))}>
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2 justify-end md:col-span-2">
                                <Button className="min-w-32" type="button" variant="destructive" onClick={() => onClose()}>
                                    Close
                                </Button>
                                <Button className="min-w-32" disabled={isPending} isLoading={isPending} type="submit" variant="primary">
                                    {product?.id ? "Update" : "Create"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ProductForm;
