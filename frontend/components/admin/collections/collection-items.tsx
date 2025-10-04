import { CollectionActions } from "./collection-actions";

import { Badge } from "@/components/ui/badge";
import { Collection } from "@/schemas/product";

interface CollectionItemProps {
    collection: Collection;
}

const CollectionItem = ({ collection }: CollectionItemProps) => {
    return (
        <div className="border border-divider rounded-lg overflow-hidden bg-card flex">
            <img alt={collection.name} className="object-cover rounded" height={100} src="/placeholder.jpg" width={100} />
            <div className="p-3 flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium mb-1">{collection.name}</h3>
                    <Badge variant={collection.is_active ? "emerald" : "destructive"}>{collection.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <span className="font-mono bg-muted px-2 py-1 rounded text-xs">/collections/{collection.slug}</span>
                <div className="mt-6">
                    <CollectionActions collection={collection} />
                </div>
            </div>
        </div>
    );
};

export default CollectionItem;
