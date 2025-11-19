"use client";

import React from "react";
import { Plus, Check, Trash2, Boxes } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useSession } from "next-auth/react";

import { SocialShare } from "./social-share";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAddProductToCatalog, useRemoveProductFromCatalog, useCatalogs } from "@/lib/hooks/useCollection";
import ComponentLoader from "@/components/component-loader";
import { DBCatalog, GalleryProduct } from "@/schemas";
import Overlay from "@/components/overlay";

interface ManageSlateProps {
    product: GalleryProduct;
}

export const ManageSlate: React.FC<ManageSlateProps> = ({ product }) => {
    const { data: session } = useSession();
    const state = useOverlayTriggerState({});
    const { data, isLoading } = useCatalogs(true);

    if (!session?.user?.isAdmin || !Boolean(product)) {
        return null;
    }

    return (
        <Overlay
            open={state.isOpen}
            title="Manage Catalogs"
            trigger={
                <Button size="icon" className="p-2">
                    <Boxes className="h-4 w-4" />
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <div className="bg-background overflow-auto">
                <div className="p-4">
                    <h3 className="text-lg font-semibold">Manage Catalogs</h3>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Product:</h4>
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                            <div key={product.id} className="relative w-16 h-16 rounded-md overflow-hidden">
                                <img
                                    alt={product.name}
                                    className="object-contain h-full w-full"
                                    src={product.images?.[0]?.image || "/placeholder.jpg"}
                                />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.categories?.[0]?.name || "No category"}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Available Collections:</h4>
                        {isLoading ? (
                            <ComponentLoader className="h-32" />
                        ) : data?.shared && data?.shared?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No catalogs available.</p>
                        ) : (
                            <ScrollArea className="h-[calc(100vh-250px)]">
                                <div className="space-y-2">
                                    {data?.shared?.map((catalog: DBCatalog, idx: number) => (
                                        <CollectionItem key={idx} catalog={catalog} product={product} />
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>
        </Overlay>
    );
};

interface CollectionItemProps {
    catalog: DBCatalog;
    product: GalleryProduct;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ catalog, product }) => {
    const hasProduct = product?.shared_collections?.some((item: DBCatalog) => item.slug === catalog.slug) || false;

    const addProductMutation = useAddProductToCatalog();
    const removeProductMutation = useRemoveProductFromCatalog();

    const handleAddToCollection = async () => {
        await addProductMutation.mutateAsync({
            collectionId: catalog.id,
            productId: product.id!,
        });
    };

    const handleRemoveFromCollection = async () => {
        await removeProductMutation.mutateAsync({
            collectionId: catalog.id,
            productId: product.id!,
        });
    };

    return (
        <Card className="bg-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">{catalog.title}</CardTitle>
                        <Badge className="text-xs" variant={catalog.is_active ? "emerald" : "destructive"}>
                            {catalog.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <SocialShare catalog={catalog} />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{catalog.products_count || 0} products</span>
                    {hasProduct ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Added</span>
                            </div>
                            <Button
                                className="text-xs"
                                disabled={!catalog.is_active || removeProductMutation.isPending}
                                isLoading={removeProductMutation.isPending}
                                size="sm"
                                variant="destructive"
                                onClick={handleRemoveFromCollection}
                            >
                                <Trash2 className="h-3 w-3" />
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="text-xs"
                            disabled={!catalog.is_active || addProductMutation.isPending}
                            isLoading={addProductMutation.isPending}
                            size="sm"
                            onClick={handleAddToCollection}
                        >
                            <Plus className="h-3 w-3" />
                            Add
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
