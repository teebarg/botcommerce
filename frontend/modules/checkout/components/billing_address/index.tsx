import { Input } from "@components/ui/input";
import React, { useState, useEffect } from "react";

import { Cart } from "@/lib/models";

const BillingAddress = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null }) => {
    const [formData, setFormData] = useState({
        "billing_address.first_name": cart?.billing_address?.first_name || "",
        "billing_address.last_name": cart?.billing_address?.last_name || "",
        "billing_address.address_1": cart?.billing_address?.address_1 || "",
        "billing_address.postal_code": cart?.billing_address?.postal_code || "",
        "billing_address.city": cart?.billing_address?.city || "",
        "billing_address.state": cart?.billing_address?.state || "",
        "billing_address.phone": cart?.billing_address?.phone || "",
    });

    useEffect(() => {
        setFormData({
            "billing_address.first_name": cart?.billing_address?.first_name || "",
            "billing_address.last_name": cart?.billing_address?.last_name || "",
            "billing_address.address_1": cart?.billing_address?.address_1 || "",
            "billing_address.postal_code": cart?.billing_address?.postal_code || "",
            "billing_address.city": cart?.billing_address?.city || "",
            "billing_address.state": cart?.billing_address?.state || "",
            "billing_address.phone": cart?.billing_address?.phone || "",
        });
    }, [cart?.billing_address]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        setFormData({
            ...formData,
            [name]: e.target.value,
        });
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Input
                    required
                    autoComplete="given-name"
                    data-testid="billing-first-name-input"
                    label="First name"
                    name="billing_address.first_name"
                    value={formData["billing_address.first_name"]}
                    onChange={(e) => handleChange(e, "billing_address.first_name")}
                />
                <Input
                    required
                    autoComplete="family-name"
                    data-testid="billing-last-name-input"
                    label="Last name"
                    name="billing_address.last_name"
                    value={formData["billing_address.last_name"]}
                    onChange={(e) => handleChange(e, "billing_address.last_name")}
                />
                <Input
                    required
                    autoComplete="address-line1"
                    data-testid="billing-address-input"
                    label="Address"
                    name="billing_address.address_1"
                    value={formData["billing_address.address_1"]}
                    onChange={(e) => handleChange(e, "billing_address.address_1")}
                />
                <Input
                    required
                    autoComplete="postal-code"
                    data-testid="billing-postal-input"
                    label="Postal code"
                    name="billing_address.postal_code"
                    value={formData["billing_address.postal_code"]}
                    onChange={(e) => handleChange(e, "billing_address.postal_code")}
                />
                <Input
                    required
                    autoComplete="address-level2"
                    data-testid="billing-city-input"
                    label="City"
                    name="billing_address.city"
                    value={formData["billing_address.city"]}
                    onChange={(e) => handleChange(e, "billing_address.city")}
                />
                <Input
                    autoComplete="address-level1"
                    data-testid="billing-state-input"
                    label="State"
                    name="billing_address.state"
                    value={formData["billing_address.state"]}
                    onChange={(e) => handleChange(e, "billing_address.state")}
                />
                <Input
                    autoComplete="tel"
                    data-testid="billing-phone-input"
                    label="Phone"
                    name="billing_address.phone"
                    value={formData["billing_address.phone"]}
                    onChange={(e) => handleChange(e, "billing_address.phone")}
                />
            </div>
        </>
    );
};

export default BillingAddress;
