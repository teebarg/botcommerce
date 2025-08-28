"use client";

import React from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import Image from "next/image";

import { SocialShare } from "./social-share";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSharedCollections, useAddProductToSharedCollection, useRemoveProductFromSharedCollection } from "@/lib/hooks/useCollection";
import ComponentLoader from "@/components/component-loader";
import { ProductSearch } from "@/schemas";
import Overlay from "@/components/overlay";
import { useSession } from "next-auth/react";

interface ManageSlateProps {
    product: ProductSearch;
}

export const ManageSlate: React.FC<ManageSlateProps> = ({ product }) => {
    const { data: session } = useSession();
    const state = useOverlayTriggerState({});
    const { data: sharedCollections, isLoading } = useSharedCollections();

    const addProductMutation = useAddProductToSharedCollection();
    const removeProductMutation = useRemoveProductFromSharedCollection();

    if (!session?.user?.isAdmin) {
        return null;
    }

    const handleAddToCollection = async (collectionId: number) => {
        await addProductMutation.mutateAsync({
            collectionId,
            productId: product.id,
        });
    };

    const handleRemoveFromCollection = async (collectionId: number) => {
        await removeProductMutation.mutateAsync({
            collectionId,
            productId: product.id,
        });
    };

    return (
        <Overlay
            open={state.isOpen}
            title="Manage Shared Collection"
            trigger={
                <Button size="sm" variant="indigo">
                    Manage Slate
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <div className="bg-background overflow-auto">
                <div className="p-4">
                    <h3 className="text-lg font-semibold">Manage Shared Collection</h3>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Product:</h4>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div key={product.id} className="relative w-12 h-12 rounded-md bg-content3 overflow-hidden p-2">
                                <Image
                                    fill
                                    alt={product.name}
                                    className="object-contain"
                                    src={product.images?.[0] || product.image || "/placeholder.jpg"}
                                />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.categories?.[0] || "No category"}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Available Collections:</h4>
                        {isLoading ? (
                            <ComponentLoader className="h-32" />
                        ) : sharedCollections?.shared?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No shared collections available.</p>
                        ) : (
                            <ScrollArea className="h-[calc(100vh-400px)]">
                                <div className="space-y-2">
                                    {sharedCollections?.shared?.map((collection, idx: number) => (
                                        <CollectionItem
                                            key={idx}
                                            collection={collection}
                                            productId={product.id}
                                            products={collection.products}
                                            onAdd={handleAddToCollection}
                                            onRemove={handleRemoveFromCollection}
                                        />
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
    collection: any;
    productId: number;
    products: ProductSearch[];
    onAdd: (collectionId: number) => void;
    onRemove: (collectionId: number) => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ collection, productId, onAdd, onRemove, products }) => {
    const hasProduct = products?.some((product) => product.id === productId) || false;

    return (
        <Card className="border">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">{collection.title}</CardTitle>
                        <Badge className="text-xs" variant={collection.is_active ? "emerald" : "destructive"}>
                            {collection.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <SocialShare collection={collection} />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{collection.products?.length || 0} products</span>
                    {hasProduct ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Added</span>
                            </div>
                            <Button
                                className="text-xs"
                                disabled={!collection.is_active}
                                size="sm"
                                variant="destructive"
                                onClick={() => onRemove(collection.id)}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <Button className="text-xs" disabled={!collection.is_active} size="sm" variant="outline" onClick={() => onAdd(collection.id)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
