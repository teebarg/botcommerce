"use client";

import ProductVariants from "@/components/products/product-variant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from "@/components/products/product-form";
import ProductImageManager from "@/components/products/product-images";
import { Product } from "@/lib/models";

export function ProductView({ product, onClose }: { product?: Product; onClose: () => void }) {
    return (
        <div className="w-[52rem] px-2 overflow-y-auto">
            <Tabs defaultValue="details">
                <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {product && <TabsTrigger value="variants">Variants</TabsTrigger>}
                    {product && <TabsTrigger value="images">Images</TabsTrigger>}
                </TabsList>
                <TabsContent className="h-full flex flex-col" value="details">
                    <ProductForm product={product} onClose={onClose} />
                </TabsContent>
                {product && (
                    <TabsContent value="variants">
                        <ProductVariants productId={product.id} variants={product?.variants || []} />
                    </TabsContent>
                )}
                {product && (
                    <TabsContent value="images">
                        <div>
                            <ProductImageManager initialImages={product?.images || []} productId={product.id} />
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
