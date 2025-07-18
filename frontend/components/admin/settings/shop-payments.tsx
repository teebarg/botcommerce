"use client";

import React from "react";
import { toast } from "sonner";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Exclamation } from "nui-react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import BankDetailsForm from "./bank-details-form";

import { Switch } from "@/components/ui/switch";
import { BankDetails, Message, ShopSettings } from "@/schemas";
import { api } from "@/apis/client";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useBankDetails } from "@/lib/hooks/useApi";
import { useSyncShopDetails } from "@/lib/hooks/useGeneric";

interface ShopPaymentsProps {
    settings: ShopSettings[];
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
        label: "Cash at Pickup",
        description: "Enable cash at pickup",
    },
];

interface BankDetailsProps {
    bank: BankDetails;
}

const BankDetailComponent: React.FC<BankDetailsProps> = ({ bank }) => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/bank-details/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bank-details"] });
            toast.success("Bank details deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete bank details");
        },
    });

    const handleDeleteBankDetails = async (id: number) => {
        deleteMutation.mutate(id);
    };

    return (
        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
                <h3 className="font-medium text-sm">{bank.bank_name}</h3>
                <p className="text-default-900 font-semibold">{bank.account_name}</p>
                <p className="text-default-700">{bank.account_number}</p>
            </div>
            <Button
                aria-label="delete"
                className="min-w-32"
                isLoading={deleteMutation.isPending}
                variant="destructive"
                onClick={() => handleDeleteBankDetails(bank.id)}
            >
                Delete
            </Button>
        </div>
    );
};

export function ShopPayments({ settings }: ShopPaymentsProps) {
    const [isLoading, setIsLoading] = React.useState<Record<string, boolean>>({});
    const syncShopDetailsMutation = useSyncShopDetails();
    const addState = useOverlayTriggerState({});

    const { data: bankDetails } = useBankDetails();

    const handleToggle = async (featureKey: string, checked: boolean) => {
        setIsLoading((prev) => ({ ...prev, [featureKey]: true }));

        syncShopDetailsMutation.mutate({
            [featureKey]: checked.toString(),
        });

        setIsLoading((prev) => ({ ...prev, [featureKey]: false }));
    };

    return (
        <div className="space-y-8 py-4">
            <div className="space-y-4">
                {defaultFeatures.map((feature, idx: number) => {
                    const existingToggle = settings.find((t) => t.key === feature.key);
                    const isEnabled = existingToggle ? existingToggle.value === "true" : false;

                    return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-content1 rounded-lg">
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
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Bank Details</h3>
                    <Overlay
                        open={addState.isOpen}
                        title="Add Bank Details"
                        trigger={
                            <Button type="button" variant="primary">
                                Add Bank Details
                            </Button>
                        }
                        onOpenChange={addState.setOpen}
                    >
                        <BankDetailsForm onClose={addState.close} />
                    </Overlay>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-content1 rounded-lg min-h-[200px] p-4">
                    {bankDetails?.map((detail, idx: number) => {
                        return <BankDetailComponent key={idx} bank={detail} />;
                    })}
                    {bankDetails?.length === 0 && (
                        <div className="flex flex-col items-center justify-center  md:col-span-2">
                            <Exclamation className="w-14 h-14 text-default-500 mb-2" />
                            <p className="text-default-800 font-semibold">No bank details found</p>
                            <p className="text-default-500 text-sm">Add bank details to enable bank transfer payments</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
