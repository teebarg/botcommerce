import React, { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";

import AddressSelect from "../address-select";

const ShippingAddress = ({
    customer,
    cart,
    checked,
    onChange,
    countryCode,
}: {
    customer: Omit<any, "password_hash"> | null;
    cart: Omit<any, "refundable_amount" | "refunded_total"> | null;
    checked: boolean;
    onChange: () => void;
    countryCode: string;
}) => {
    const [formData, setFormData] = useState({
        "shipping_address.first_name": cart?.shipping_address?.first_name || "",
        "shipping_address.last_name": cart?.shipping_address?.last_name || "",
        "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
        "shipping_address.company": cart?.shipping_address?.company || "",
        "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
        "shipping_address.city": cart?.shipping_address?.city || "",
        "shipping_address.country_code": process.env.NEXT_PUBLIC_COUNTRY_CODE || cart?.shipping_address?.country_code || countryCode || "",
        "shipping_address.province": cart?.shipping_address?.province || "",
        email: cart?.email || "",
        "shipping_address.phone": cart?.shipping_address?.phone || "",
    });

    const countriesInRegion = useMemo(() => cart?.region.countries.map((c) => c.iso_2), [cart?.region]);

    // check if customer has saved addresses that are in the current region
    const addressesInRegion = useMemo(
        () => customer?.shipping_addresses.filter((a) => a.country_code && countriesInRegion?.includes(a.country_code)),
        [customer?.shipping_addresses, countriesInRegion]
    );

    useEffect(() => {
        setFormData({
            "shipping_address.first_name": cart?.shipping_address?.first_name || "",
            "shipping_address.last_name": cart?.shipping_address?.last_name || "",
            "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
            "shipping_address.company": cart?.shipping_address?.company || "",
            "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
            "shipping_address.city": cart?.shipping_address?.city || "",
            "shipping_address.country_code": process.env.NEXT_PUBLIC_COUNTRY_CODE || cart?.shipping_address?.country_code || "",
            "shipping_address.province": cart?.shipping_address?.province || "",
            email: cart?.email || "",
            "shipping_address.phone": cart?.shipping_address?.phone || "",
        });
    }, [cart?.shipping_address, cart?.email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const countryOptions = useMemo(() => {
        if (!cart?.region) {
            return [];
        }

        return cart?.region.countries.map((country) => ({
            value: country.iso_2,
            label: country.display_name,
        }));
    }, [cart?.region]);

    return (
        <React.Fragment>
            {customer && (addressesInRegion?.length || 0) > 0 && (
                <div className="shadow-md bg-default-50 w-full rounded-lg mb-6 flex flex-col gap-y-4 p-5">
                    <p className="text-small-regular">{`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}</p>
                    <AddressSelect addresses={customer.shipping_addresses} cart={cart} />
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <Input
                    isRequired
                    autoComplete="given-name"
                    data-testid="shipping-first-name-input"
                    label="First name"
                    name="shipping_address.first_name"
                    value={formData["shipping_address.first_name"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="family-name"
                    data-testid="shipping-last-name-input"
                    label="Last name"
                    name="shipping_address.last_name"
                    value={formData["shipping_address.last_name"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="address-line1"
                    data-testid="shipping-address-input"
                    label="Address"
                    name="shipping_address.address_1"
                    value={formData["shipping_address.address_1"]}
                    onChange={handleChange}
                />
                <Input
                    autoComplete="organization"
                    data-testid="shipping-company-input"
                    label="Company"
                    name="shipping_address.company"
                    value={formData["shipping_address.company"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="postal-code"
                    data-testid="shipping-postal-code-input"
                    label="Postal code"
                    name="shipping_address.postal_code"
                    value={formData["shipping_address.postal_code"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="address-level2"
                    data-testid="shipping-city-input"
                    label="City"
                    name="shipping_address.city"
                    value={formData["shipping_address.city"]}
                    onChange={handleChange}
                />
                <Input
                    autoComplete="address-level1"
                    data-testid="shipping-province-input"
                    label="State / Province"
                    name="shipping_address.province"
                    value={formData["shipping_address.province"]}
                    onChange={handleChange}
                />
            </div>
            <div className="my-8">
                <Checkbox data-testid="billing-address-checkbox" isSelected={checked} onValueChange={onChange}>
                    Billing address same as shipping address
                </Checkbox>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                    isRequired
                    autoComplete="email"
                    data-testid="shipping-email-input"
                    label="Email"
                    name="email"
                    title="Enter a valid email address."
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <Input
                    autoComplete="tel"
                    data-testid="shipping-phone-input"
                    label="Phone"
                    name="shipping_address.phone"
                    value={formData["shipping_address.phone"]}
                    onChange={handleChange}
                />
            </div>
        </React.Fragment>
    );
};

export default ShippingAddress;
