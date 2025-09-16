"use client";

import React from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { SocialShare } from "./social-share";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useAddProductToSharedCollection,
    useRemoveProductFromSharedCollection,
    useAllSharedCollections,
} from "@/lib/hooks/useCollection";
import ComponentLoader from "@/components/component-loader";
import { DBCatalog, SearchImageItem } from "@/schemas";
import Overlay from "@/components/overlay";

interface ManageSlateProps {
    product: SearchImageItem;
}

export const ManageSlate: React.FC<ManageSlateProps> = ({ product }) => {
    const { data: session } = useSession();
    const state = useOverlayTriggerState({});
    const { data: catalogs, isLoading } = useAllSharedCollections();

    if (!session?.user?.isAdmin || !Boolean(product)) {
        return null;
    }

    return (
        <Overlay
            open={state.isOpen}
            title="Manage Catalogs"
            trigger={
                <Button size="sm" variant="indigo">
                    Catalogs
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
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div key={product.id} className="relative w-12 h-12 rounded-md bg-content3 overflow-hidden p-2">
                                <Image fill alt={product.name} className="object-contain" src={product.image || "/placeholder.jpg"} />
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
                        ) : catalogs && catalogs?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No catalogs available.</p>
                        ) : (
                            <ScrollArea className="h-[calc(100vh-250px)]">
                                <div className="space-y-2">
                                    {catalogs?.map((catalog: DBCatalog, idx: number) => (
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
    product: SearchImageItem;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ catalog, product }) => {
    const hasProduct = product?.catalogs?.some((item: string) => item === catalog.slug) || false;

    const addProductMutation = useAddProductToSharedCollection();
    const removeProductMutation = useRemoveProductFromSharedCollection();

    const handleAddToCollection = async () => {
        await addProductMutation.mutateAsync({
            collectionId: catalog.id,
            productId: product.product_id!,
        });
    };

    const handleRemoveFromCollection = async () => {
        await removeProductMutation.mutateAsync({
            collectionId: catalog.id,
            productId: product.product_id!,
        });
    };

    return (
        <Card className="border">
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
                    {/* <span className="text-xs text-muted-foreground">{collection.products_count || 0} products</span> */}
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
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="text-xs"
                            disabled={!catalog.is_active || addProductMutation.isPending}
                            isLoading={addProductMutation.isPending}
                            size="sm"
                            variant="indigo"
                            onClick={handleAddToCollection}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
