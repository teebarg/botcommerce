import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface Collection {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    productCount: number;
}

interface CollectionItemProps {
    collection: Collection;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const CollectionItem = ({ collection, onEdit, onDelete }: CollectionItemProps) => {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="aspect-video w-full bg-gray-100 relative">
                <img alt={collection.name} className="w-full h-full object-cover" src={collection.imageUrl || "/placeholder.svg"} />
            </div>
            <div className="p-3">
                <h3 className="font-medium text-default-900 mb-1">{collection.name}</h3>
                <p className="text-sm text-default-500 mb-2 line-clamp-2">{collection.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-default-500">{collection.productCount} products</span>
                    <div className="flex gap-1">
                        <Button size="icon" onClick={() => onEdit(collection.id)}>
                            <Edit size={16} />
                        </Button>
                        <Button size="icon" onClick={() => onDelete(collection.id)}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionItem;
