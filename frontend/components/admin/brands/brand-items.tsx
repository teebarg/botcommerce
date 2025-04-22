import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface Brand {
    id: string;
    name: string;
    logoUrl: string;
    productCount: number;
}

interface BrandItemProps {
    brand: Brand;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const BrandItem = ({ brand, onEdit, onDelete }: BrandItemProps) => {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center">
            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2">
                <img alt={brand.name} className="max-w-full max-h-full object-contain" src={brand.logoUrl || "/placeholder.svg"} />
            </div>
            <div className="flex-1 p-3">
                <h3 className="font-medium text-default-900">{brand.name}</h3>
                <p className="text-xs text-default-500">{brand.productCount} products</p>
            </div>
            <div className="flex pr-3 gap-1">
                <Button size="icon" onClick={() => onEdit(brand.id)}>
                    <Edit size={16} />
                </Button>
                <Button size="icon" onClick={() => onDelete(brand.id)}>
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
};

export default BrandItem;
