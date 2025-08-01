import React, { useState, useMemo } from "react";
import { MapPin } from "lucide-react";

import ShippingAddressForm from "../address-form";

import { AddressCard } from "./address-item";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Address } from "@/schemas";
import { useUserAddresses } from "@/lib/hooks/useCart";
import ComponentLoader from "@/components/component-loader";

interface AddressStepProps {
    address: Address | null;
}

const AddressStep: React.FC<AddressStepProps> = ({ address }) => {
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];

    const selectedAddress = useMemo(() => addresses.find((a) => a.id === address?.id), [addresses, address]);

    const [addressOption, setAddressOption] = useState<"existing" | "new">("existing");
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    if (isLoading) {
        return <ComponentLoader className="h-24" />;
    }

    return (
        <Card className="w-full shadow-elegant animate-fade-in">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold flex items-center justify-center space-x-2">
                    <MapPin className="h-6 w-6 text-accent" />
                    <span>Shipping Address</span>
                </CardTitle>
                <CardDescription>Enter your delivery address details</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Choose Address Option</Label>
                        <RadioGroup value={addressOption} onValueChange={(value: "existing" | "new") => setAddressOption(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="existing" value="existing" />
                                <Label htmlFor="existing">Select from previous addresses</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="new" value="new" />
                                <Label htmlFor="new">Enter new address</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {addressOption === "existing" && (
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Select Address</Label>
                            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                {addresses.map((addr: Address, idx: number) => (
                                    <AddressCard key={idx} address={addr} addresses={addresses} selectedAddress={selectedAddress} />
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {addressOption === "new" && (
                        <div className="space-y-6 border-t pt-6">
                            <ShippingAddressForm onClose={() => setAddressOption("existing")} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressStep;
