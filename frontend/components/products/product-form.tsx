"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/multi-select";
import { Category, Collection, Product } from "@/schemas/product";
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/useProduct";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Product name must be at least 2 characters.",
    }),
    description: z.string(),
    categories: z.array(z.any()),
    collections: z.array(z.any()),
    active: z.boolean(),
});

interface ProductFormProps {
    product?: Product;
    onClose: () => void;
    collections: Collection[];
    categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, collections, categories }) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            categories: product?.categories?.map((category: Category) => ({ value: category.id, label: category.name })) || [],
            collections: product?.collections?.map((collection: Collection) => ({ value: collection.id, label: collection.name })) || [],
            active: product?.active,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { categories, collections, ...data } = values;
        const categoryIds = categories.map((category) => category.value);
        const collectionIds = collections.map((collection) => collection.value);

        setIsPending(true);
        try {
            const productData = {
                ...data,
                category_ids: categoryIds,
                collection_ids: collectionIds,
            };

            if (product?.id) {
                await updateProduct.mutateAsync({
                    id: product.id,
                    input: productData,
                });
            } else {
                await createProduct.mutateAsync(productData);
            }
            if (!product?.id) {
                onClose?.();
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="overflow-y-auto flex flex-col pb-4 mt-4 min-h-[70vh]">
            <Form {...form}>
                <form className="space-y-6 h-full flex-1" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="w-full h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
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
                            {/* <FormField
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
                            /> */}
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm text-default-500">Show in Store</FormLabel>
                                            <FormMessage />
                                        </div>
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
