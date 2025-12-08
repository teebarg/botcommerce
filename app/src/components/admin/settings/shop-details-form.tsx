import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ShopSettings } from "@/schemas";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { useSyncShopDetails } from "@/hooks/useGeneric";

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
        key: "email_bcc",
        label: "Email BCC (comma-separated)",
        type: "text",
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
        email_bcc: "",
        shop_description: "",
        contact_phone: "",
        address: "",
        tax_rate: 0,
        whatsapp: "+234",
    });
    const syncShopDetailsMutation = useSyncShopDetails();

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
                        <div key={idx} className={cn("", detail.type === "textarea" ? "md:col-span-2" : "")}>
                            <label className="text-sm text-muted-foreground">{detail.label}</label>
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
