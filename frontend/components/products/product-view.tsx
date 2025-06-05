"use client";

import ProductVariants from "@/components/products/product-variant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from "@/components/products/product-form";
import ProductImagesManager from "@/components/admin/product/product-images";
import { Product } from "@/types/models";
import { useCollections, useCategories, useBrands } from "@/lib/hooks/useApi";

export function ProductView({ product, onClose }: { product?: Product; onClose: () => void }) {
    const { data: collections } = useCollections();
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    return (
        <div className="w-full mx-auto overflow-y-auto py-6 px-4">
            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {product && <TabsTrigger value="variants">Variants</TabsTrigger>}
                    {product && <TabsTrigger value="images">Images</TabsTrigger>}
                </TabsList>
                <TabsContent value="details">
                    <ProductForm
                        brands={brands || []}
                        categories={categories || []}
                        collections={collections || []}
                        product={product}
                        onClose={onClose}
                    />
                </TabsContent>
                {product && (
                    <TabsContent value="variants">
                        <ProductVariants productId={product.id} productImage={product?.image || ""} variants={product?.variants || []} />
                    </TabsContent>
                )}
                {product && (
                    <TabsContent value="images">
                        <div className="pb-6 pt-2">
                            <ProductImagesManager initialImages={product?.images || []} productId={product.id} />
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
