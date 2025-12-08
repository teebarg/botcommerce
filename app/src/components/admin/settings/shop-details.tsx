import { ShopDetailsForm } from "./shop-details-form";
import { ShopSocialForm } from "./shop-social-form";

import type { ShopSettings } from "@/schemas";

interface ShopDetailsProps {
    settings: ShopSettings[];
}

export function ShopDetails({ settings }: ShopDetailsProps) {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-card rounded-lg">
                <h3 className="font-medium mb-2">Shop Details</h3>
                <ShopDetailsForm settings={settings} />
            </div>
            <div className="p-4 bg-card rounded-lg">
                <h3 className="font-medium mb-2">Social Media</h3>
                <ShopSocialForm settings={settings} />
            </div>
        </div>
    );
}
