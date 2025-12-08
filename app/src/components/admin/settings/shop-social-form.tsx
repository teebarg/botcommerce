import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { ShopSettings } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useSyncShopDetails } from "@/hooks/useGeneric";

interface ShopDetailsProps {
    settings: ShopSettings[];
}

const defaultShopDetails = [
    {
        key: "facebook",
        label: "Facebook (Ex. teebarg)",
    },
    {
        key: "instagram",
        label: "Instagram (Ex. teebarg)",
    },
    {
        key: "tiktok",
        label: "Tiktok (Ex. teebarg)",
    },
    {
        key: "x",
        label: "X (Twitter) (Ex. teebarg)",
    },
];

export function ShopSocialForm({ settings }: ShopDetailsProps) {
    const syncShopDetailsMutation = useSyncShopDetails();
    const [formData, setFormData] = useState<Record<string, any>>({
        facebook: "",
        instagram: "",
        tiktok: "",
        x: "",
    });

    useEffect(() => {
        defaultShopDetails.forEach((detail) => {
            const existingSetting = settings.find((s) => s.key === detail.key);

            if (existingSetting) {
                setFormData((prev) => ({ ...prev, [detail.key]: existingSetting.value }));
            }
        });
    }, [settings]);

    const handleUpdate = async () => {
        syncShopDetailsMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultShopDetails.map((detail, idx: number) => {
                    return (
                        <div key={idx}>
                            <label className="text-sm text-muted-foreground">{detail.label}</label>
                            <Input
                                placeholder={`Enter ${detail.label.toLowerCase()}`}
                                type="text"
                                value={formData[detail.key]}
                                onChange={(newValue) => setFormData((prev) => ({ ...prev, [detail.key]: newValue.target.value }))}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end">
                <Button
                    disabled={syncShopDetailsMutation.isPending}
                    isLoading={syncShopDetailsMutation.isPending}
                    type="button"
                    onClick={handleUpdate}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
