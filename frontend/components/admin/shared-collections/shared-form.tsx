import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, Sparkles } from "lucide-react";
import { ProductSearchComponent } from "@/components/store/products/product-search";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProductSearch, SharedSchema, Shared } from "@/schemas/product";
import { useUpdateSharedCollection } from "@/lib/hooks/useCollection";

interface SharedFormProps {
    current?: Shared;
    onClose?: () => void;
}

// type SharedFormValues = z.infer<typeof SharedSchema>;

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
        <div className="min-h-screen bg-gradient-subtle p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        {current ? "Edit Collection" : "Create Collection"}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">Shared Collection</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Create a beautiful collection of products to share with your audience. Organize, curate, and showcase your favorite items.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-primary rounded-full"></div>
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
                                                    <Input {...field} placeholder="My Amazing Collection" required />
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
                        <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-primary rounded-full"></div>
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
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/50 animate-fade-in"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div className="flex-1">
                                                        <h5 className="font-medium">{product.name}</h5>
                                                        <p className="text-sm text-muted-foreground">${product.price}</p>
                                                        {product.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeProduct(product.id)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={formState.isSubmitting || !form.watch("title")}
                                className="px-8 py-4 text-base font-semibold"
                                isLoading={formState.isSubmitting}
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
