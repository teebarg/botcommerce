import type React from "react";
import { useState, useMemo } from "react";
import { MapPin, ChevronRight, Plus } from "lucide-react";
import ShippingAddressForm from "../address-form";
import { AddressCard } from "./address-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Address } from "@/schemas";
import ComponentLoader from "@/components/component-loader";
import { useUserAddresses } from "@/hooks/useAddress";
import { AnimatePresence, motion } from "framer-motion";

interface AddressStepProps {
    address: Address | null | undefined;
    onComplete?: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ address, onComplete }) => {
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];

    const selectedAddress = useMemo(() => addresses.find((a) => a.id === address?.id), [addresses, address]);

    const [addressOption, setAddressOption] = useState<"existing" | "new">("existing");
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    const handleContinue = () => {
        if (address && onComplete) {
            onComplete();
        }
    };

    const canContinue = !!address;

    if (isLoading) {
        return <ComponentLoader className="h-48" />;
    }

    return (
        <>
            <div className="space-y-4 px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Delivery Address</h2>
                    <p className="text-muted-foreground">Where should we send your order?</p>
                </motion.div>

                <div className="space-y-3">
                    {addressOption === "existing" && (
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
                    )}

                    {/* Add New Address Button */}
                    {addressOption === "existing" && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Button
                                variant="outline"
                                onClick={() => setAddressOption("new")}
                                className="w-full h-auto p-4 rounded-2xl border-2 border-dashed justify-start gap-4 border-primary bg-primary/5"
                            >
                                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Add New Address</span>
                            </Button>
                        </motion.div>
                    )}

                    {/* New Address Form */}
                    <AnimatePresence>
                        {addressOption === "new" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-6 border-t pt-6"
                            >
                                <ShippingAddressForm onClose={() => setAddressOption("existing")} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="flex justify-end py-2 sticky px-4 bottom-0 border-t md:border-t-0 bg-background mt-4">
                <Button
                    disabled={!canContinue || addressOption === "new"}
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
