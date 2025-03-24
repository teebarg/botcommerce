"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AddressSelect from "../address-select";

import { Cart, CartUpdate } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import compareAddresses from "@/lib/util/compare-addresses";

const ShippingAddress = ({
    customer,
    cart,
}: {
    customer: Omit<any, "password_hash"> | null;
    cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null;
}) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        "shipping_address.first_name": cart?.shipping_address?.first_name || "",
        "shipping_address.last_name": cart?.shipping_address?.last_name || "",
        "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
        "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
        "shipping_address.city": cart?.shipping_address?.city || "",
        "shipping_address.state": cart?.shipping_address?.state || "",
        email: cart?.email || "",
        "shipping_address.phone": cart?.shipping_address?.phone || "",
    });

    useEffect(() => {
        setFormData({
            "shipping_address.first_name": cart?.shipping_address?.first_name || "",
            "shipping_address.last_name": cart?.shipping_address?.last_name || "",
            "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
            "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
            "shipping_address.city": cart?.shipping_address?.city || "",
            "shipping_address.state": cart?.shipping_address?.state || "",
            email: cart?.email || "",
            "shipping_address.phone": cart?.shipping_address?.phone || "",
        });
    }, [cart?.shipping_address, cart?.email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        setFormData({
            ...formData,
            [name]: e.target.value,
        });
    };
    // const sameAsBilling = cart?.shipping_address && cart?.billing_address ? compareAddresses(cart?.shipping_address, cart?.billing_address) : true;

    const handleSubmit = async () => {
        setIsPending(true);
        const sameAsBilling = true;

        const updateData: CartUpdate = {
            shipping_address: {
                first_name: formData["shipping_address.first_name"],
                last_name: formData["shipping_address.last_name"],
                address_1: formData["shipping_address.address_1"],
                address_2: "",
                postal_code: formData["shipping_address.postal_code"],
                city: formData["shipping_address.city"],
                state: formData["shipping_address.state"],
                phone: formData["shipping_address.phone"],
                is_billing: false,
            },
            email: formData["email"],
        };

        updateData.billing_address = updateData.shipping_address;

        // if (sameAsBilling === "on") {
        //     updateData.billing_address = updateData.shipping_address;
        // } else {
        //     updateData.billing_address = {
        //         first_name: formData.get("billing_address.first_name") as string,
        //         last_name: formData.get("billing_address.last_name") as string,
        //         address_1: formData.get("billing_address.address_1") as string,
        //         address_2: "",
        //         postal_code: formData.get("billing_address.postal_code") as string,
        //         city: formData.get("billing_address.city") as string,
        //         state: formData.get("billing_address.state") as string,
        //         phone: formData.get("billing_address.phone") as string,
        //         is_billing: true,
        //     };
        // }

        const { error } = await api.cart.updateDetails(updateData);

        setIsPending(false);

        if (error) {
            toast.error(error);

            return;
        }

        router.push(`/checkout?step=delivery`);
    };

    return (
        <React.Fragment>
            {customer && (customer.shipping_addresses?.length || 0) > 0 && (
                <div className="shadow-md bg-default-100 w-full rounded-lg mb-6 flex flex-col gap-y-4 p-5">
                    <p className="text-sm">{`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}</p>
                    <AddressSelect addresses={customer.shipping_addresses} cart={cart} />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    required
                    autoComplete="given-name"
                    data-testid="shipping-first_name-input"
                    label="First name"
                    name="shipping_address.first_name"
                    value={formData["shipping_address.first_name"]}
                    onChange={(e) => handleChange(e, "shipping_address.first_name")}
                />
                <Input
                    required
                    autoComplete="family-name"
                    data-testid="shipping-last_name-input"
                    label="Last name"
                    name="shipping_address.last_name"
                    value={formData["shipping_address.last_name"]}
                    onChange={(e) => handleChange(e, "shipping_address.last_name")}
                />
                <Input
                    required
                    autoComplete="address-line1"
                    data-testid="shipping-address-input"
                    label="Address"
                    name="shipping_address.address_1"
                    value={formData["shipping_address.address_1"]}
                    onChange={(e) => handleChange(e, "shipping_address.address_1")}
                />
                <Input
                    required
                    autoComplete="postal-code"
                    data-testid="shipping-postal-code-input"
                    label="Postal code"
                    name="shipping_address.postal_code"
                    value={formData["shipping_address.postal_code"]}
                    onChange={(e) => handleChange(e, "shipping_address.postal_code")}
                />
                <Input
                    required
                    autoComplete="address-level2"
                    data-testid="shipping-city-input"
                    label="City"
                    name="shipping_address.city"
                    value={formData["shipping_address.city"]}
                    onChange={(e) => handleChange(e, "shipping_address.city")}
                />
                <Input
                    autoComplete="address-level1"
                    data-testid="shipping-state-input"
                    label="State"
                    name="shipping_address.state"
                    value={formData["shipping_address.state"]}
                    onChange={(e) => handleChange(e, "shipping_address.state")}
                />
            </div>
            {/* <div className="my-8">
                <Checkbox
                    data-testid="billing-address-checkbox"
                    defaultSelected={checked}
                    label="Billing address same as shipping address"
                    onChange={onChange}
                />
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <Input
                    required
                    autoComplete="email"
                    data-testid="shipping-email-input"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange(e, "email")}
                />
                <Input
                    autoComplete="tel"
                    data-testid="shipping-phone-input"
                    label="Phone"
                    name="shipping_address.phone"
                    value={formData["shipping_address.phone"]}
                    onChange={(e) => handleChange(e, "shipping_address.phone")}
                />
            </div>
            <Button
                aria-label="continue"
                className="mt-6"
                data-testid="submit-address-button"
                isLoading={isPending}
                type="button"
                onClick={handleSubmit}
            >
                Continue to delivery
            </Button>
        </React.Fragment>
    );
};

export default ShippingAddress;
