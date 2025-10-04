import { BrandActions } from "./brand-actions";

import { Badge } from "@/components/ui/badge";
import { Brand } from "@/schemas/product";

interface BrandItemProps {
    brand: Brand;
}

const BrandItem: React.FC<BrandItemProps> = ({ brand }) => {
    return (
        <div className="border border-border rounded-lg overflow-hidden bg-secondary flex items-center py-4 px-3">
            <div className="flex-1 flex items-center">
                <h3 className="font-medium">{brand.name}</h3>
                <Badge className="ml-1" variant={brand.is_active ? "emerald" : "destructive"}>
                    {brand.is_active ? "Active" : "Inactive"}
                </Badge>
            </div>

            <BrandActions item={brand} />
        </div>
    );
};

export default BrandItem;
