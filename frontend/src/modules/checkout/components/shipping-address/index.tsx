import React, { useState, useEffect } from "react";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { Cart } from "types/global";

import AddressSelect from "../address-select";

const ShippingAddress = ({
    customer,
    cart,
    checked,
    onChange,
}: {
    customer: Omit<any, "password_hash"> | null;
    cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null;
    checked: boolean;
    onChange: () => void;
}) => {
    const [formData, setFormData] = useState({
        "shipping_address.firstname": cart?.shipping_address?.firstname || "",
        "shipping_address.lastname": cart?.shipping_address?.lastname || "",
        "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
        "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
        "shipping_address.city": cart?.shipping_address?.city || "",
        "shipping_address.state": cart?.shipping_address?.state || "",
        email: cart?.email || "",
        "shipping_address.phone": cart?.shipping_address?.phone || "",
    });

    useEffect(() => {
        setFormData({
            "shipping_address.firstname": cart?.shipping_address?.firstname || "",
            "shipping_address.lastname": cart?.shipping_address?.lastname || "",
            "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
            "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
            "shipping_address.city": cart?.shipping_address?.city || "",
            "shipping_address.state": cart?.shipping_address?.state || "",
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

    return (
        <React.Fragment>
            {customer && (customer.shipping_addresses?.length || 0) > 0 && (
                <div className="shadow-md bg-default-50 w-full rounded-lg mb-6 flex flex-col gap-y-4 p-5">
                    <p className="text-small-regular">{`Hi ${customer.firstname}, do you want to use one of your saved addresses?`}</p>
                    <AddressSelect addresses={customer.shipping_addresses} cart={cart} />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    isRequired
                    autoComplete="given-name"
                    data-testid="shipping-first-name-input"
                    label="First name"
                    name="shipping_address.firstname"
                    value={formData["shipping_address.firstname"]}
                    onChange={handleChange}
                />
                <Input
                    isRequired
                    autoComplete="family-name"
                    data-testid="shipping-last-name-input"
                    label="Last name"
                    name="shipping_address.lastname"
                    value={formData["shipping_address.lastname"]}
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
                    data-testid="shipping-state-input"
                    label="State"
                    name="shipping_address.state"
                    value={formData["shipping_address.state"]}
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
