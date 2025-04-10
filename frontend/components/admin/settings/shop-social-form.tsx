"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { ShopSettings } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";

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
    const [formData, setFormData] = useState<Record<string, any>>({
        facebook: "",
        instagram: "",
        tiktok: "",
        x: "",
    });
    const [isPending, setIsPending] = useState<boolean>(false);

    useEffect(() => {
        defaultShopDetails.forEach((detail) => {
            const existingSetting = settings.find((s) => s.key === detail.key);

            if (existingSetting) {
                setFormData((prev) => ({ ...prev, [detail.key]: existingSetting.value }));
            }
        });
    }, [settings]);

    const handleUpdate = async () => {
        setIsPending(true);
        const { error } = await api.shopSettings.syncShopDetails(formData);

        if (error) {
            toast.error(error);
        } else {
            toast.success("Shop details updated successfully");
        }
        setIsPending(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultShopDetails.map((detail) => {
                    return (
                        <div key={detail.key}>
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
                <Button disabled={isPending} isLoading={isPending} type="button" variant="default" onClick={handleUpdate}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
