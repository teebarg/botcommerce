"use client";

import React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { ShopSettings } from "@/types/models";
import { api } from "@/apis";

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

    /**
     * Toggles the feature's active state.
     *
     * This function checks if a feature toggle with the given key already exists. If it does,
     * it updates the toggle's state based on the `checked` parameter. If it doesn't exist,
     * it creates a new toggle with the provided key and sets its state.
     *
     * @param featureKey - The unique key representing the feature toggle.
     * @param checked - A boolean indicating whether the feature is active or not.
     */
    const handleToggle = async (featureKey: string, checked: boolean) => {
        setIsLoading((prev) => ({ ...prev, [featureKey]: true }));

        const { error } = await api.shopSettings.syncShopDetails({
            [featureKey]: checked.toString(),
        });

        if (error) {
            toast.error("Failed to update feature");
        } else {
            toast.success("Feature updated successfully");
        }

        setIsLoading((prev) => ({ ...prev, [featureKey]: false }));
    };

    return (
        <div className="space-y-4 py-4">
            {defaultFeatures.map((feature) => {
                const existingToggle = toggles.find((t) => t.key === feature.key);
                const isEnabled = existingToggle ? existingToggle.value === "true" : false;

                return (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-content1 rounded-lg">
                        <div>
                            <h3 className="font-medium">{feature.label}</h3>
                            <p className="text-sm text-default-500">{feature.description}</p>
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
