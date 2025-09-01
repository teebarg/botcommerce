"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductVariant } from "@/schemas";
import { useCreateVariant, useUpdateVariant } from "@/lib/hooks/useProduct";

interface ProductVariantFormProps {
    variant: ProductVariant | null;
    productId: number;
    onCancel: () => void;
}

const variantFormSchema = z.object({
    price: z.number().min(1, {
        message: "Price must be at least 1.",
    }),
    old_price: z.number().optional(),
    inventory: z.number().min(0, {
        message: "Inventory must be at least 0.",
    }),
    size: z.string().optional(),
    color: z.string().optional(),
    measurement: z.number().optional(),
});

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({ productId, variant, onCancel }) => {
    const createVariant = useCreateVariant();
    const updateVariant = useUpdateVariant();

    const form = useForm<z.infer<typeof variantFormSchema>>({
        resolver: zodResolver(variantFormSchema),
        defaultValues: {
            price: variant?.price || 1,
            old_price: variant?.old_price || 0,
            inventory: variant?.inventory || 0,
            size: variant?.size || "",
            color: variant?.color || "",
            measurement: variant?.measurement || undefined,
        },
    });

    const loading = createVariant.isPending || updateVariant.isPending;

    const resetForm = () => {
        form.reset({
            price: variant?.price || 1,
            old_price: variant?.old_price || 0,
            inventory: variant?.inventory || 0,
            size: variant?.size || "",
            color: variant?.color || "",
            measurement: variant?.measurement || undefined,
        });
    };

    useEffect(() => {
        resetForm();
    }, [variant]);

    async function onSubmit(values: z.infer<typeof variantFormSchema>) {
        if (variant?.id) {
            await updateVariant.mutateAsync({ ...values, id: variant.id });
        } else {
            await createVariant.mutateAsync({ productId, ...values });
        }
        resetForm();
        onCancel();
    }

    return (
        <div className="py-4 rounded-md">
            <p className="text-default-500 mt-8 font-semibold">Manage variant</p>
            <div className="bg-content1 p-4 rounded-lg">
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                                name="size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter size" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter color" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="measurement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Measurement</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter measurement (e.g., 41, 42)"
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
                                name="inventory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inventory</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter inventory"
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            {variant && (
                                <Button className="min-w-32" disabled={loading} type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                            )}
                            <Button className="min-w-32" disabled={loading} isLoading={loading} type="submit" variant="primary">
                                {variant ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default ProductVariantForm;
