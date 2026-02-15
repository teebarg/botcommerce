import React from "react";
import { toast } from "sonner";
import { useOverlayTriggerState } from "react-stately";
import { ShieldAlert } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import BankDetailsForm from "./bank-details-form";
import { Switch } from "@/components/ui/switch";
import type { BankDetails, ShopSettings } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useBankDetails } from "@/hooks/useApi";
import { useSyncShopDetails } from "@/hooks/useGeneric";
import { deleteBankDetailsFn } from "@/server/generic.server";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

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
        label: "Payment at Pickup",
        description: "Enable payment at pickup",
    },
];

interface BankDetailsProps {
    bank: BankDetails;
}

const BankDetailComponent: React.FC<BankDetailsProps> = ({ bank }) => {
    const deleteState = useOverlayTriggerState({});
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => await deleteBankDetailsFn({ data: id }),
        onSuccess: () => {
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
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
                <h3 className="font-medium text-sm">{bank.bank_name}</h3>
                <p className="font-semibold">{bank.account_name}</p>
                <p className="text-muted-foreground">{bank.account_number}</p>
            </div>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button aria-label="delete" className="min-w-32" variant="destructive">
                        Delete
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={() => handleDeleteBankDetails(bank.id)}
                title="Delete details"
                description="This action cannot be undone. This will permanently delete the category and all its subcategories."
                isLoading={deleteMutation.isPending}
            />
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
        <div className="space-y-8">
            <div className="space-y-4 bg-card px-2 py-4">
                {defaultFeatures?.map((feature, idx: number) => {
                    const existingToggle = settings?.find((t) => t.key === feature.key);
                    const isEnabled = existingToggle ? existingToggle.value === "true" : false;

                    return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg">
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
            <div className="bg-card px-2 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Bank Details</h3>
                    <SheetDrawer
                        open={addState.isOpen}
                        title="Add Bank Details"
                        trigger={<Button type="button">Add Bank Details</Button>}
                        onOpenChange={addState.setOpen}
                    >
                        <BankDetailsForm onClose={addState.close} />
                    </SheetDrawer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 rounded-lg">
                    {bankDetails?.map((detail: BankDetails, idx: number) => {
                        return <BankDetailComponent key={idx} bank={detail} />;
                    })}
                    {bankDetails?.length === 0 && (
                        <div className="flex flex-col items-center justify-center md:col-span-2 bg-contrast/10 p-4 rounded-lg">
                            <ShieldAlert className="w-14 h-14 text-muted-foreground mb-2" />
                            <p className="font-semibold">No bank details found</p>
                            <p className="text-muted-foreground text-sm">Add bank details to enable bank transfer payments</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
