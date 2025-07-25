import React from "react";
import { Save, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSearchComponent } from "@/components/store/products/product-search";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProductSearch, SharedSchema, Shared } from "@/schemas";
import { useUpdateSharedCollection } from "@/lib/hooks/useCollection";
import { currency } from "@/lib/utils";
import { useProductVariant } from "@/lib/hooks/useProductVariant";

interface SharedFormProps {
    current?: Shared;
    onClose?: () => void;
}

// type SharedFormValues = z.infer<typeof SharedSchema>;

const ProductCard: React.FC<{ product: ProductSearch; index: number; removeProduct: (productId: number) => void }> = ({
    product,
    index,
    removeProduct,
}) => {
    const { priceInfo } = useProductVariant(product);

    return (
        <div
            className="flex items-center gap-2 p-4 bg-secondary/20 rounded-lg border border-border/50 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div>
                <Image
                    alt={product.name}
                    className="object-contain"
                    height={80}
                    src={product.images[0] || product.image || "/placeholder.jpg"}
                    width={80}
                />
            </div>
            <div className="flex-1">
                <h5 className="font-medium">{product.name}</h5>
                <p className="text-lg text-default-700">{currency(priceInfo.minPrice)}</p>
                {product.description && <p className="text-xs text-muted-foreground mt-1">{product.description}</p>}
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
    const form = useForm<Shared>({
        resolver: zodResolver(SharedSchema),
        defaultValues: {
            title: current?.title || "",
            description: current?.description || "",
            products: current?.products || [],
            is_active: current?.is_active ?? true,
        } as any,
    });

    const updateShared = useUpdateSharedCollection();

    const { handleSubmit, control, setValue, watch, formState } = form;
    const products = watch("products");

    const onSubmit = async (values: Shared) => {
        try {
            if (current?.id) {
                await updateShared.mutateAsync({ id: current.id, data: values });
                toast.success("Shared collection updated successfully");
            } else {
                // TODO: implement create mutation
                toast.success("Shared collection created successfully");
            }
            onClose?.();
        } catch (error) {
            toast.error("Error", {
                description: "Failed to save collection. Please try again.",
            });
        }
    };

    const addProduct = (product: ProductSearch) => {
        setValue("products", [...products, product]);
    };

    const removeProduct = (productId: number) => {
        setValue(
            "products",
            products.filter((p: ProductSearch) => p.id !== productId)
        );
    };

    return (
        <div className="p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        {current ? "Edit Collection" : "Create Collection"}
                    </div>
                    <h1 className="text-4xl font-bold text-default-700">Shared Collection</h1>
                </div>

                <Form {...form}>
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
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
                        <Card className="border-0 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                    Products ({products.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <ProductSearchComponent onAddProduct={addProduct} />
                                {products.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-foreground">Selected Products:</h4>
                                        <div className="grid gap-4">
                                            {products.map((product: ProductSearch, index: number) => (
                                                <ProductCard key={product.id} index={index} product={product} removeProduct={removeProduct} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <div className="flex justify-center gap-2">
                            {onClose && (
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                className="px-8 py-4 text-base font-semibold"
                                disabled={formState.isSubmitting || !form.watch("title")}
                                isLoading={formState.isSubmitting}
                                size="lg"
                                type="submit"
                                variant="primary"
                            >
                                <Save className="h-5 w-5" />
                                {current ? "Update Collection" : "Create Collection"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};
