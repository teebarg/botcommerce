"use client";

import React from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useSharedCollections } from "@/lib/hooks/useCollection";
import { useAuth } from "@/providers/auth-provider";

interface ProductCollectionIndicatorProps {
    product: { id: number; name: string; [key: string]: any };
}

export const ProductCollectionIndicator: React.FC<ProductCollectionIndicatorProps> = ({ product }) => {
    const { user } = useAuth();
    const { data: sharedCollections } = useSharedCollections();

    if (user?.role !== "ADMIN") {
        return null;
    }

    const activeCollections = sharedCollections?.shared?.filter((collection) => collection.is_active) || [];
    const collectionsWithProduct = activeCollections.filter((collection) => collection.products?.some((p) => p.id === product.id));

    if (collectionsWithProduct.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-600" />
            <Badge className="text-xs" variant="blue">
                In {collectionsWithProduct.length} collection{collectionsWithProduct.length > 1 ? "s" : ""}
            </Badge>
        </div>
    );
};
