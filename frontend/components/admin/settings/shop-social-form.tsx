"use client";

import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { ShopSettings } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useSyncShopDetails } from "@/lib/hooks/useGeneric";

interface ShopDetailsProps {
    settings: ShopSettings[];
}

const defaultShopDetails = [
    {
        key: "facebook",
        label: "Facebook",
    },
    {
        key: "instagram",
        label: "Instagram",
    },
    {
        key: "tiktok",
        label: "Tiktok",
    },
    {
        key: "x",
        label: "X (Twitter)",
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
                            <label className="text-sm text-default-500">{detail.label}</label>
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
                    variant="primary"
                    onClick={handleUpdate}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
