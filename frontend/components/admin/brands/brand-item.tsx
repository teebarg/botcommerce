import { BrandActions } from "./brand-actions";

import { Badge } from "@/components/ui/badge";
import { Brand } from "@/types/models";

interface BrandItemProps {
    brand: Brand;
}

const BrandItem: React.FC<BrandItemProps> = ({ brand }) => {
    return (
        <div className="border border-default rounded-lg overflow-hidden bg-content1 flex items-center py-4 px-3">
            <div className="flex-1 flex items-center">
                <h3 className="font-medium text-default-900">{brand.name}</h3>
                <Badge className="ml-1" variant={brand.is_active ? "success" : "destructive"}>
                    {brand.is_active ? "Active" : "Inactive"}
                </Badge>
            </div>

            <BrandActions item={brand} />
        </div>
    );
};

export default BrandItem;
