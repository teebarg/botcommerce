import React from "react";
import { Switch } from "@/components/ui/switch";
import type { ShopSettings } from "@/schemas";
import { useSyncShopDetails } from "@/hooks/useGeneric";

interface FeatureTogglesProps {
    toggles: ShopSettings[];
}

const defaultFeatures = [
    {
        key: "feature_reviews",
        label: "Product Reviews",
        description: "Allow customers to leave reviews on products",
    },
    {
        key: "feature_wishlist",
        label: "Wishlist",
        description: "Enable wishlist functionality for customers",
    },
    {
        key: "feature_related_products",
        label: "Related Products",
        description: "Show related products on product pages",
    },
    {
        key: "feature_chatbot",
        label: "Chatbot",
        description: "Enable chatbot functionality for customers",
    },
    {
        key: "feature_whatsapp",
        label: "WhatsApp",
        description: "Enable WhatsApp functionality for customers",
    },
];

export function FeatureToggles({ toggles }: FeatureTogglesProps) {
    const [isLoading, setIsLoading] = React.useState<Record<string, boolean>>({});

    const syncShopDetailsMutation = useSyncShopDetails();

    const handleToggle = async (featureKey: string, checked: boolean) => {
        setIsLoading((prev) => ({ ...prev, [featureKey]: true }));

        syncShopDetailsMutation.mutate({
            [featureKey]: checked.toString(),
        });

        setIsLoading((prev) => ({ ...prev, [featureKey]: false }));
    };

    return (
        <div className="space-y-4 py-8 px-2 bg-card">
            {defaultFeatures.map((feature) => {
                const existingToggle = toggles.find((t) => t.key === feature.key);
                const isEnabled = existingToggle ? existingToggle.value === "true" : false;

                return (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div>
                            <h3 className="font-medium">{feature.label}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <Switch
                            checked={isEnabled}
                            disabled={isLoading[feature.key]}
                            onCheckedChange={(checked) => handleToggle(feature.key, checked)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
