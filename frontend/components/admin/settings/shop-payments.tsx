"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Switch } from "@/components/ui/switch";
import { BankDetails, ShopSettings } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShopPaymentsProps {
    settings: ShopSettings[];
    bankDetails: BankDetails[];
}

const defaultFeatures = [
    {
        key: "payment_paystack",
        label: "Paystack",
        description: "Enable Paystack payment gateway",
    },
    {
        key: "payment_bank",
        label: "Bank Transfer",
        description: "Enable bank transfer payment gateway",
    },
    {
        key: "payment_card",
        label: "Card Payment",
        description: "Enable card payment gateway",
    },
    {
        key: "payment_cash",
        label: "Cash on Delivery",
        description: "Enable cash on delivery payment gateway",
    },
];

interface BankDetailsProps {
    bank: BankDetails;
}

const BankDetailComponent: React.FC<BankDetailsProps> = ({ bank }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDeleteBankDetails = async (id: number) => {
        setIsLoading(true);
        const { error } = await api.bank.deleteBankDetails(id);

        if (!error) {
            toast.success("Bank details deleted successfully");
        } else {
            toast.error("Failed to delete bank details");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
                <h3 className="font-medium">{bank.bank_name}</h3>
                <p className="text-sm text-default-900">{bank.account_name}</p>
                <p className="text-sm text-default-500">{bank.account_number}</p>
            </div>
            <Button
                aria-label="delete"
                className="min-w-36"
                isLoading={isLoading}
                variant="destructive"
                onClick={() => handleDeleteBankDetails(bank.id)}
            >
                Delete
            </Button>
        </div>
    );
};

export function ShopPayments({ settings, bankDetails }: ShopPaymentsProps) {
    const [isLoading, setIsLoading] = React.useState<Record<string, boolean>>({});
    const [isPending, setIsPending] = React.useState<boolean>(false);
    const [formData, setFormData] = useState<Record<string, any>>({
        bank_name: "",
        account_name: "",
        account_number: "",
    });
    const deleteState = useOverlayTriggerState({});

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

    const handleAddBankDetails = async () => {
        setIsPending(true);
        const { error } = await api.bank.createBankDetails({
            bank_name: formData.bank_name,
            account_name: formData.account_name,
            account_number: formData.account_number,
        });

        if (!error) {
            toast.success("Bank details added successfully");
            deleteState.close();
            setFormData({
                bank_name: "",
                account_name: "",
                account_number: "",
            });
        } else {
            toast.error("Failed to add bank details");
        }

        setIsPending(false);
    };

    return (
        <div className="space-y-4 py-4">
            {defaultFeatures.map((feature) => {
                const existingToggle = settings.find((t) => t.key === feature.key);
                const isEnabled = existingToggle ? existingToggle.value === "true" : false;

                return (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
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
            {/* bank details */}
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Bank Details</h3>
                    <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                        <DialogTrigger asChild>
                            <Button type="button">Add Bank Details</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-content1">
                            <DialogHeader>
                                <DialogTitle>Add Bank Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <form>
                                    <Input
                                        placeholder="Enter bank name"
                                        value={formData.bank_name}
                                        onChange={(newValue) => setFormData((prev) => ({ ...prev, bank_name: newValue.target.value }))}
                                    />
                                    <Input
                                        placeholder="Enter account name"
                                        value={formData.account_name}
                                        onChange={(newValue) => setFormData((prev) => ({ ...prev, account_name: newValue.target.value }))}
                                    />
                                    <Input
                                        placeholder="Enter account number"
                                        type="number"
                                        value={formData.account_number}
                                        onChange={(newValue) => setFormData((prev) => ({ ...prev, account_number: newValue.target.value }))}
                                    />
                                </form>
                            </div>
                            <DialogFooter>
                                <Button aria-label="close" className="min-w-36" variant="outline" onClick={deleteState.close}>
                                    Close
                                </Button>
                                <Button aria-label="delete" className="min-w-36" isLoading={isPending} onClick={handleAddBankDetails}>
                                    Submit
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankDetails.map((detail, idx: number) => {
                        return <BankDetailComponent key={idx} bank={detail} />;
                    })}
                </div>
            </div>
        </div>
    );
}
