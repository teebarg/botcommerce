import React, { useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ShippingAddressForm from "../address-form";

import { AddressCard } from "./address-item";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Address } from "@/schemas";
import { useUserAddresses } from "@/lib/hooks/useCart";
import ComponentLoader from "@/components/component-loader";

interface AddressStepProps {
    onAddressSubmitted: (address: any) => void;
    address: Address | null;
}

const AddressStep: React.FC<AddressStepProps> = ({ onAddressSubmitted, address }) => {
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];

    const state = useOverlayTriggerState({});
    const [searchQuery, setSearchQuery] = useState<string>("");

    const selectedAddress = useMemo(() => addresses.find((a) => a.id === address?.id), [addresses, address]);

    const [addressOption, setAddressOption] = useState<"existing" | "new">("existing");
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //handle submit
    };

    // const isFormValid =
    //     addressOption === "existing"
    //         ? selectedAddressId !== ""
    //         : address.fullName && address.phone && address.street && address.city && address.state && address.zipCode;

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

                    {/* New Address Form */}
                    {addressOption === "new" && (
                        <div className="space-y-6 border-t pt-6">
                            <ShippingAddressForm onClose={() => setAddressOption("existing")} />
                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            placeholder="Enter your full name"
                                            className="pl-10"
                                            value={address.fullName}
                                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            className="pl-10"
                                            value={address.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div> */}
                            {/*
                            <div className="space-y-2">
                                <Label htmlFor="street">Street Address *</Label>
                                <Input
                                    id="street"
                                    placeholder="123 Main Street, Apt 4B"
                                    value={address.street}
                                    onChange={(e) => handleInputChange("street", e.target.value)}
                                    required
                                />
                            </div> */}

                            {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        placeholder="City"
                                        value={address.city}
                                        onChange={(e) => handleInputChange("city", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State *</Label>
                                    <Select value={address.state} onValueChange={(value) => handleInputChange("state", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AL">Alabama</SelectItem>
                                            <SelectItem value="CA">California</SelectItem>
                                            <SelectItem value="FL">Florida</SelectItem>
                                            <SelectItem value="NY">New York</SelectItem>
                                            <SelectItem value="TX">Texas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">ZIP Code *</Label>
                                    <Input
                                        id="zipCode"
                                        placeholder="12345"
                                        value={address.zipCode}
                                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                        required
                                    />
                                </div>
                            </div> */}
                        </div>
                    )}

                    <div className="flex justify-center pt-4">
                        <Button className="px-12" size="lg" type="submit" variant="luxury">
                            Continue to Payment
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressStep;
