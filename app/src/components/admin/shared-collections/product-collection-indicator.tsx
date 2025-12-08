import React from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useCatalogs } from "@/hooks/useCollection";
import { useRouteContext } from "@tanstack/react-router";

interface ProductCollectionIndicatorProps {
    product: { id: number; name: string; [key: string]: any };
}

export const ProductCollectionIndicator: React.FC<ProductCollectionIndicatorProps> = ({ product }) => {
    const { session } = useRouteContext({ strict: false });
    const { data } = useCatalogs();

    if (!session?.user?.isAdmin) {
        return null;
    }

    const activeCollections = data?.shared?.filter((catalog) => catalog.is_active) || [];
    const collectionsWithProduct = activeCollections.filter((catalog) => catalog.products?.some((p) => p.id === product.id));

    if (collectionsWithProduct.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 mt-2">
            <Check className="h-3 w-3 text-green-600" />
            <Badge className="text-xs" variant="blue">
                In {collectionsWithProduct.length} catalog{collectionsWithProduct.length > 1 ? "s" : ""}
            </Badge>
        </div>
    );
};
