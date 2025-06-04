import { CollectionActions } from "./collection-actions";

import { Badge } from "@/components/ui/badge";
import { Collection } from "@/types/models";

interface CollectionItemProps {
    collection: Collection;
    deleteAction: (id: number) => void;
}

const CollectionItem = ({ collection, deleteAction }: CollectionItemProps) => {
    return (
        <div className="border border-default rounded-lg overflow-hidden bg-content1">
            <div className="aspect-video w-full relative">
                <img alt={collection.name} className="w-full h-full object-cover" src="/placeholder.jpg" />
            </div>
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-default-900 mb-1">{collection.name}</h3>
                    <Badge variant={collection.is_active ? "emerald" : "destructive"}>{collection.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-default-500 mb-2 line-clamp-2">{collection.slug}</p>
                <div className="flex justify-between items-center">
                    <CollectionActions collection={collection} deleteAction={deleteAction} />
                </div>
            </div>
        </div>
    );
};

export default CollectionItem;
