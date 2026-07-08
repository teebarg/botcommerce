import type React from "react";
import { useState, useMemo } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { AddressCard } from "./address-item";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Address } from "@/schemas";
import { useUserAddresses } from "@/hooks/useAddress";
import SheetDrawer from "@/components/sheet-drawer";
import { useOverlayTriggerState } from "react-stately";
import CheckoutAddressForm from "../checkout-address-form";
import { PageLoader } from "@/components/generic/page-loader";

interface AddressStepProps {
    address: Address | null | undefined;
    onComplete?: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ address, onComplete }) => {
    const state = useOverlayTriggerState({});
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];

    const selectedAddress = useMemo(() => addresses.find((a) => a.id === address?.id), [addresses, address]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    const handleContinue = () => {
        if (address && onComplete) {
            onComplete();
        }
    };

    if (isLoading) {
        return <PageLoader variant="radio" rows={4} className="px-4" />;
    }

    return (
        <div className="space-y-4 px-4 py-4 flex-1 overflow-y-auto slide-in">
            <div className="text-center mb-1">
                <h2 className="text-xl font-bold">Delivery Address</h2>
                <p className="text-muted-foreground text-sm">Where should we send your order?</p>
            </div>
            <div className="space-y-3">
                <div className="space-y-3">
                    <Label className="text-base font-medium block">Select Address</Label>
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        {addresses.map((addr: Address, idx: number) => (
                            <div key={addr.id}>
                                <AddressCard key={idx} address={addr} addresses={addresses} selectedAddress={selectedAddress} />
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <SheetDrawer
                    open={state.isOpen}
                    title="Address"
                    trigger={
                        <Button
                            variant="outline"
                            className="w-full h-auto p-4 rounded-2xl border-2 border-dashed justify-start gap-4 border-primary bg-primary/5"
                        >
                            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Add New Address</span>
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <CheckoutAddressForm onClose={state.close} />
                </SheetDrawer>
            </div>
        </div>
    );
};

export default AddressStep;
