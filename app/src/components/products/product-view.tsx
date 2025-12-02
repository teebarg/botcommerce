"use client";

import ProductVariants from "@/components/products/product-variant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from "@/components/products/product-form";
import { ProductSearch } from "@/schemas/product";
import { useCollections } from "@/lib/hooks/useCollection";
import { useCategories } from "@/lib/hooks/useCategories";

export function ProductView({ product, onClose }: { product?: ProductSearch; onClose: () => void }) {
    const { data: collections } = useCollections();
    const { data: categories } = useCategories();

    return (
        <div className="w-full mx-auto overflow-y-auto py-6 px-4">
            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {product && <TabsTrigger value="variants">Variants</TabsTrigger>}
                    {/* {product && <TabsTrigger value="images">Images</TabsTrigger>} */}
                </TabsList>
                <TabsContent value="details">
                    <ProductForm categories={categories || []} collections={collections || []} product={product} onClose={onClose} />
                </TabsContent>
                {product && (
                    <TabsContent value="variants">
                        <ProductVariants productId={product.id} variants={product?.variants || []} />
                    </TabsContent>
                )}
                {/* {product && (
                    <TabsContent value="images">
                        <div className="pb-6 pt-2">
                            <ProductImagesManager initialImages={product?.images || []} productId={product.id} />
                        </div>
                    </TabsContent>
                )} */}
            </Tabs>
        </div>
    );
}
