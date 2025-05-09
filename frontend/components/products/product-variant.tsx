"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductVariant } from "@/types/models";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";

interface ProductVariantsProps {
    variants: ProductVariant[];
    productId: number;
    productImage: string;
}

const variantFormSchema = z.object({
    name: z.string().min(2, {
        message: "Product name must be at least 2 characters.",
    }),
    sku: z.string().optional(),
    status: z.enum(["IN_STOCK", "OUT_OF_STOCK"]),
    price: z.number().min(0, {
        message: "Price must be at least 0.",
    }),
    inventory: z.number().min(0, {
        message: "Inventory must be at least 0.",
    }),
});

const ProductVariants: React.FC<ProductVariantsProps> = ({ productImage, productId, variants = [] }) => {
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const form = useForm<z.infer<typeof variantFormSchema>>({
        resolver: zodResolver(variantFormSchema),
        defaultValues: {
            name: "",
            sku: "",
            status: "IN_STOCK",
            price: 0,
            inventory: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof variantFormSchema>) {
        let response;

        setLoading(true);
        if (editingVariant?.id) {
            response = await api.product.updateVariant({ ...values, id: editingVariant.id });
        } else {
            response = await api.product.createVariant({ productId, image: productImage, ...values });
        }

        if (response.error) {
            toast.error(`Error - ${response.error}`);
            setLoading(false);

            return;
        }

        toast.success(`Variant ${editingVariant?.id ? "updated" : "created"} successfully`);
        invalidate("products");
        invalidate("product-search");
        form.reset();
        setLoading(false);
    }

    const handleEdit = (variant: ProductVariant) => {
        setEditingVariant(variant);
        form.setValue("name", variant.name);
        form.setValue("sku", variant.sku);
        form.setValue("status", variant.status);
        form.setValue("price", variant.price);
        form.setValue("inventory", variant.inventory);
    };

    const deleteVariant = (id: number) => {
        api.product
            .deleteVariant(id)
            .then(() => {
                toast.success(`Variant deleted successfully`);
                invalidate("products");
                invalidate("product-search");
            })
            .catch((error) => {
                toast.error(`Error - ${error as string}`);
            });
    };

    return (
        <div>
            <h4 className="text-lg font-medium text-default-800 mt-4">Product Variants</h4>
            <div className="py-4 rounded-md">
                <div className="max-h-[250px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                {["Name", "SKU", "Price", "Inventory", "Status", "Actions"]?.map((variant: string, idx: number) => (
                                    <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-default-500 uppercase tracking-wider">
                                        {variant}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {variants?.map((variant: ProductVariant, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.sku}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.price}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">{variant.inventory}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500">
                                        <Badge variant={variant.status === "IN_STOCK" ? "default" : "destructive"}>{variant.status}</Badge>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium flex items-center">
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit(variant)}>
                                            <Edit className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => deleteVariant(variant.id)}>
                                            <Trash2 className="h-5 w-5 text-danger" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {variants.length === 0 && (
                                <tr>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-default-500 text-center" colSpan={6}>
                                        No variants found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="text-default-500 mt-4 text-xl font-medium">Add new variant</p>
                <div className="bg-content1 p-4 rounded-lg">
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
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
                            </div>
                            <div className="flex justify-end">
                                <Button className="min-w-32" disabled={loading} isLoading={loading} type="submit">
                                    {editingVariant ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ProductVariants;
