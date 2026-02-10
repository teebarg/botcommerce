import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShopDetailsForm } from "./shop-details-form";
import { ShopSocialForm } from "./shop-social-form";
import type { ShopSettings } from "@/schemas";
import { useSyncShopDetails } from "@/hooks/useGeneric";

interface ShopDetailsProps {
    settings: ShopSettings[];
}

export function ShopDetails({ settings }: ShopDetailsProps) {
    const themeSetting = settings?.find((s) => s.key === "theme");
    const syncShopDetailsMutation = useSyncShopDetails();
    const onUpdate = (e: string) => {
        syncShopDetailsMutation.mutateAsync({ theme: e }).then(() => {
            window.location.reload();
        });
    };
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
            <div className="p-4 bg-card rounded-lg">
                <h3 className="font-medium mb-2">System</h3>
                <Select defaultValue={themeSetting?.value || ""} onValueChange={onUpdate}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="ibm-blue">Ibm Blue</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
