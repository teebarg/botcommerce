import { CollectionActions } from "./collection-actions";

import { Badge } from "@/components/ui/badge";
import { Collection } from "@/schemas/product";
import Image from "next/image";

interface CollectionItemProps {
    collection: Collection;
}

const CollectionItem = ({ collection }: CollectionItemProps) => {
    return (
        <div className="border border-default rounded-lg overflow-hidden bg-content1">
            <div className="aspect-video w-full relative">
                <Image
                    alt={collection.name}
                    className="object-cover rounded"
                    src="/placeholder.jpg"
                    width={100}
                    height={100}
                    placeholder="blur"
                    blurDataURL="/placeholder.jpg"
                />
            </div>
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-default-900 mb-1">{collection.name}</h3>
                    <Badge variant={collection.is_active ? "emerald" : "destructive"}>{collection.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-default-500 mb-2 line-clamp-2">{collection.slug}</p>
                <div className="flex justify-between items-center">
                    <CollectionActions collection={collection} />
                </div>
            </div>
        </div>
    );
};

export default CollectionItem;
