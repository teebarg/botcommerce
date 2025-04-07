"use client";

import React, { useState } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { AddressType, CartUpdate } from "@/types/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ShippingAddressForm = ({ onClose }: { onClose?: () => void }) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        label: "",
        address_type: "HOME" as AddressType,
        first_name: "",
        last_name: "",
        address_1: "",
        postal_code: "",
        city: "",
        state: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        setFormData({
            ...formData,
            [name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        setIsPending(true);

        const updateData: CartUpdate = {
            shipping_address: {
                first_name: formData["first_name"],
                last_name: formData["last_name"],
                address_type: formData["address_type"],
                label: formData["label"],
                address_1: formData["address_1"],
                address_2: "",
                postal_code: formData["postal_code"],
                city: formData["city"],
                state: formData["state"],
                phone: formData["phone"],
                is_billing: false,
            },
        };

        updateData.billing_address = updateData.shipping_address;

        const { error } = await api.cart.updateDetails(updateData);

        setIsPending(false);

        if (error) {
            toast.error(error);

            return;
        }
        onClose?.();
    };

    return (
        <React.Fragment>
            <form>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-default-500 mb-0.5 block">Address Type</label>
                        <Select
                            value={formData["address_type"]}
                            onValueChange={(value) => setFormData({ ...formData, address_type: value as AddressType })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HOME">Home</SelectItem>
                                <SelectItem value="WORK">Work</SelectItem>
                                <SelectItem value="BILLING">Billing</SelectItem>
                                <SelectItem value="SHIPPING">Shipping</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        required
                        data-testid="shipping-first_name-input"
                        label="Label (Optional)"
                        name="label"
                        placeholder="e.g., Home, Office"
                        value={formData["label"]}
                        onChange={(e) => handleChange(e, "label")}
                    />
                    <Input
                        required
                        autoComplete="given-name"
                        data-testid="shipping-first_name-input"
                        label="First name"
                        name="first_name"
                        value={formData["first_name"]}
                        onChange={(e) => handleChange(e, "first_name")}
                    />
                    <Input
                        required
                        autoComplete="family-name"
                        data-testid="shipping-last_name-input"
                        label="Last name"
                        name="last_name"
                        value={formData["last_name"]}
                        onChange={(e) => handleChange(e, "last_name")}
                    />
                    <Input
                        required
                        autoComplete="address-line1"
                        data-testid="shipping-address-input"
                        label="Address"
                        name="address_1"
                        value={formData["address_1"]}
                        onChange={(e) => handleChange(e, "address_1")}
                    />
                    <Input
                        required
                        autoComplete="postal-code"
                        data-testid="shipping-postal-code-input"
                        label="Postal code"
                        name="postal_code"
                        value={formData["postal_code"]}
                        onChange={(e) => handleChange(e, "postal_code")}
                    />
                    <Input
                        required
                        autoComplete="address-level2"
                        data-testid="shipping-city-input"
                        label="City"
                        name="city"
                        value={formData["city"]}
                        onChange={(e) => handleChange(e, "city")}
                    />
                    <div>
                        <label className="text-sm font-medium text-default-500 mb-0.5 block">State</label>
                        <Select
                            data-testid="shipping-state-input"
                            value={formData["state"]}
                            onValueChange={(value) => setFormData({ ...formData, state: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                                {["Abuja", "Lagos", "Rivers", "Oyo"].map((item: string, idx: number) => (
                                    <SelectItem key={idx} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        autoComplete="tel"
                        data-testid="shipping-phone-input"
                        label="Phone"
                        name="phone"
                        value={formData["phone"]}
                        onChange={(e) => handleChange(e, "phone")}
                    />
                </div>
            </form>
            <Button
                aria-label="continue"
                className="mt-6"
                data-testid="submit-address-button"
                isLoading={isPending}
                type="button"
                onClick={handleSubmit}
            >
                Create
            </Button>
        </React.Fragment>
    );
};

export default ShippingAddressForm;
