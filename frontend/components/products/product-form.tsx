"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";

import ProductImageManager from "./product-image";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import MultiSelect from "@/components/ui/multi-select";
import { useStore } from "@/app/store/use-store";
import { Category, Collection, Product } from "@/types/models";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Product name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    categories: z.array(z.any()).min(1, {
        message: "Please select at least one category.",
    }),
    collections: z.array(z.any()).min(1, {
        message: "Please select at least one collection.",
    }),
    brand: z.number().min(1, {
        message: "Please select at least one brand.",
    }),
    // tags: z.array(z.any()).min(1, {
    //     message: "Please select at least one tag.",
    // }),
    price: z.number().min(0, {
        message: "Price must be at least 0.",
    }),
    old_price: z.number().optional(),
    sku: z.string().optional(),
    status: z.string().min(3, {
        message: "Status must be at least 3 characters.",
    }),
});

const ProductForm: React.FC<{ product?: Product; onClose: () => void }> = ({ product, onClose }) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const { collections, categories, brands } = useStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            sku: product?.sku || "",
            status: product?.status || "",
            brand: product?.brand?.id || 0,
            categories: product?.categories?.map((category: Category) => ({ value: category.id, label: category.name })) || [],
            collections: product?.collections?.map((collection: Collection) => ({ value: collection.id, label: collection.name })) || [],
            // tags: product?.tags?.map((tag) => ({ value: tag.id, label: tag.name })) || [],
            price: product?.price || 0,
            old_price: product?.old_price || 0,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const { brand, categories, collections, ...data } = values;
        const categoryIds = categories.map((category) => category.value);
        const collectionIds = collections.map((collection) => collection.value);

        setIsPending(true);

        void (async () => {
            try {
                let res = null;

                if (product?.id) {
                    res = await api.product.update(product.id, {
                        ...data,
                        category_ids: categoryIds,
                        collection_ids: collectionIds,
                        brand_id: brand,
                        tags_ids: [],
                    });
                } else {
                    res = await api.product.create({
                        ...data,
                        category_ids: categoryIds,
                        collection_ids: collectionIds,
                        brand_id: brand,
                        tags_ids: [],
                    });
                }
                if (res.error) {
                    toast.error(`Error - ${res.error}`);
                } else {
                    toast.success(`Product ${product?.id ? "updated" : "created"} successfully`);
                }
                // onClose?.();
            } catch (error) {
                toast.error(`Error - ${error as string}`);
            } finally {
                setIsPending(false);
            }
        })();
    }

    return (
        <div className="overflow-y-auto flex-1 flex flex-col">
            {product?.id && <ProductImageManager initialImage={product?.image || ""} productId={product?.id || 0} />}
            <Form {...form}>
                <form className="space-y-6 h-full flex-1" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="rounded-lg shadow-xl w-full h-full">
                        {/* Product Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter SKU" {...field} />
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
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter price"
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="old_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Old Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter old price"
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
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
                            <div className="flex gap-2 justify-end col-span-2">
                                <Button type="button" variant="destructive" onClick={() => onClose()}>
                                    Close
                                </Button>
                                <Button disabled={isPending} isLoading={isPending} type="submit">
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
