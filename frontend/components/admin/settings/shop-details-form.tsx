"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { ShopSettings } from "@/types/models";
import { api } from "@/apis";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";

interface ShopDetailsProps {
    settings: ShopSettings[];
}

const defaultShopDetails = [
    {
        key: "shop_name",
        label: "Shop Name",
        type: "text",
    },
    {
        key: "address",
        label: "Shop Address",
        type: "text",
    },
    {
        key: "contact_phone",
        label: "Contact Phone",
        type: "tel",
    },
    {
        key: "contact_email",
        label: "Contact Email",
        type: "email",
    },
    {
        key: "shop_email",
        label: "Shop Email",
        type: "email",
    },
    {
        key: "shop_description",
        label: "Shop Description",
        type: "textarea",
    },
    {
        key: "tax_rate",
        label: "Tax Rate (%)",
        type: "number",
    },
    {
        key: "whatsapp",
        label: "Whatsapp",
        type: "tel",
    },
];

export function ShopDetailsForm({ settings }: ShopDetailsProps) {
    const [formData, setFormData] = useState<Record<string, any>>({
        shop_name: "",
        contact_email: "",
        shop_email: "",
        shop_description: "",
        contact_phone: "",
        address: "",
        tax_rate: 0,
        whatsapp: "+234",
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
                        <div key={detail.key} className={cn("", detail.type === "textarea" ? "md:col-span-2" : "")}>
                            <label className="text-sm text-default-500">{detail.label}</label>
                            {detail.type === "textarea" ? (
                                <Textarea
                                    placeholder={`Enter ${detail.label.toLowerCase()}`}
                                    value={formData[detail.key]}
                                    onChange={(newValue) => setFormData((prev) => ({ ...prev, [detail.key]: newValue.target.value }))}
                                />
                            ) : (
                                <Input
                                    placeholder={`Enter ${detail.label.toLowerCase()}`}
                                    type={detail.type}
                                    value={formData[detail.key]}
                                    onChange={(newValue) => setFormData((prev) => ({ ...prev, [detail.key]: newValue.target.value }))}
                                />
                            )}
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
