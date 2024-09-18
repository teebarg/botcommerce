import React, { useState, useEffect } from "react";
import { Input } from "@nextui-org/input";

const BillingAddress = ({ cart, countryCode }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null; countryCode: string }) => {
    const [formData, setFormData] = useState({
        "billing_address.first_name": cart?.billing_address?.first_name || "",
        "billing_address.last_name": cart?.billing_address?.last_name || "",
        "billing_address.address_1": cart?.billing_address?.address_1 || "",
        "billing_address.company": cart?.billing_address?.company || "",
        "billing_address.postal_code": cart?.billing_address?.postal_code || "",
        "billing_address.city": cart?.billing_address?.city || "",
        "billing_address.country_code": cart?.billing_address?.country_code || countryCode || "",
        "billing_address.province": cart?.billing_address?.province || "",
        "billing_address.phone": cart?.billing_address?.phone || "",
    });

    useEffect(() => {
        setFormData({
            "billing_address.first_name": cart?.billing_address?.first_name || "",
            "billing_address.last_name": cart?.billing_address?.last_name || "",
            "billing_address.address_1": cart?.billing_address?.address_1 || "",
            "billing_address.company": cart?.billing_address?.company || "",
            "billing_address.postal_code": cart?.billing_address?.postal_code || "",
            "billing_address.city": cart?.billing_address?.city || "",
            "billing_address.country_code": cart?.billing_address?.country_code || "",
            "billing_address.province": cart?.billing_address?.province || "",
            "billing_address.phone": cart?.billing_address?.phone || "",
        });
    }, [cart?.billing_address]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Input
                    isRequired
                    autoComplete="given-name"
                    data-testid="billing-first-name-input"
                    label="First name"
                    name="billing_address.first_name"
                    value={formData["billing_address.first_name"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="family-name"
                    data-testid="billing-last-name-input"
                    label="Last name"
                    name="billing_address.last_name"
                    value={formData["billing_address.last_name"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="address-line1"
                    data-testid="billing-address-input"
                    label="Address"
                    name="billing_address.address_1"
                    value={formData["billing_address.address_1"]}
                    onChange={handleChange}
                />
                <Input
                    autoComplete="organization"
                    data-testid="billing-company-input"
                    label="Company"
                    name="billing_address.company"
                    value={formData["billing_address.company"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="postal-code"
                    data-testid="billing-postal-input"
                    label="Postal code"
                    name="billing_address.postal_code"
                    value={formData["billing_address.postal_code"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="address-level2"
                    data-testid="billing-city-input"
                    label="City"
                    name="billing_address.city"
                    value={formData["billing_address.city"]}
                    onChange={handleChange}
                />
                <Input
                    autoComplete="address-level1"
                    data-testid="billing-province-input"
                    label="State / Province"
                    name="billing_address.province"
                    value={formData["billing_address.province"]}
                    onChange={handleChange}
                />
                <Input
                    autoComplete="tel"
                    data-testid="billing-phone-input"
                    label="Phone"
                    name="billing_address.phone"
                    value={formData["billing_address.phone"]}
                    onChange={handleChange}
                />
            </div>
        </>
    );
};

export default BillingAddress;
