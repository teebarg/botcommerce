import type React from "react";
import { useState, useMemo } from "react";
import { ChevronRight, Plus } from "lucide-react";
import ShippingAddressForm from "../address-form";
import { AddressCard } from "./address-item";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Address } from "@/schemas";
import ComponentLoader from "@/components/component-loader";
import { useUserAddresses } from "@/hooks/useAddress";
import { motion } from "framer-motion";
import SheetDrawer from "@/components/sheet-drawer";
import { useOverlayTriggerState } from "react-stately";

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
        return <ComponentLoader className="h-48" />;
    }

    return (
        <>
            <div className="space-y-4 px-4 py-4 flex-1 overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Delivery Address</h2>
                    <p className="text-muted-foreground">Where should we send your order?</p>
                </motion.div>

                <div className="space-y-3">
                    <div className="space-y-3">
                        <Label className="text-base font-medium block">Select Address</Label>
                        <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                            {addresses.map((addr: Address, idx: number) => (
                                <motion.div
                                    key={addr.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <AddressCard key={idx} address={addr} addresses={addresses} selectedAddress={selectedAddress} />
                                </motion.div>
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
                                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Add New Address</span>
                            </Button>
                        }
                        onOpenChange={state.setOpen}
                    >
                        <ShippingAddressForm onClose={state.close} />
                    </SheetDrawer>
                </div>
            </div>
            <div className="sheet-footer">
                <Button
                    disabled={!Boolean(address)}
                    size="lg"
                    onClick={handleContinue}
                    className="bg-gradient-action shadow-glow hover:opacity-90 transition-opacity h-14 rounded-2xl text-base font-semibold w-full md:w-sm"
                >
                    Continue
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </>
    );
};

export default AddressStep;
