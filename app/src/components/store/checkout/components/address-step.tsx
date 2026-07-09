import type React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Address } from "@/schemas";
import { useUserAddresses } from "@/hooks/useAddress";
import SheetDrawer from "@/components/sheet-drawer";
import { useOverlayTriggerState } from "react-stately";
import CheckoutAddressForm from "../checkout-address-form";
import { PageLoader } from "@/components/generic/page-loader";
import { AddressCard } from "./address-card";
import { omit } from "@/utils";
import { useUpdateCartDetails } from "@/hooks/useCart";

interface AddressStepProps {
    address: Address | null | undefined;
}

const AddressStep: React.FC<AddressStepProps> = ({ address }) => {
    const state = useOverlayTriggerState({});
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];
    const [selectedAddressId, setSelectedAddressId] = useState<string>(address?.id?.toString() ?? "");
    const updateCartDetails = useUpdateCartDetails();

    const handleSelectionChange = (id: string) => {
        if (updateCartDetails.isPending) return;
        setSelectedAddressId(id)
        const savedAddress = addresses.find((a) => a.id.toString() == id);
        if (savedAddress) {
            updateCartDetails.mutateAsync({
                shipping_address: omit(savedAddress, ["created_at"]) as any,
            });
        }
    }

    if (isLoading) {
        return <PageLoader variant="radio" rows={4} className="px-4" />;
    }

    return (
        <div className="space-y-4 py-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Delivery Address</h2>
                <p className="text-muted-foreground text-sm">Where should we send your order?</p>
            </div>
            <div className="space-y-3">
                <RadioGroup variant="address" value={selectedAddressId} onValueChange={handleSelectionChange}>
                    {addresses.map((addr: Address, idx: number) => (
                        <AddressCard key={idx} address={addr} />
                    ))}
                </RadioGroup>
                <SheetDrawer
                    open={state.isOpen}
                    title="Address"
                    trigger={
                        <Button
                            variant="outline"
                            className="w-full h-auto p-4 rounded-2xl border border-dashed text-accent"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add new address</span>
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
