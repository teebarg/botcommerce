"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AddressSelect from "../address-select";

import { Cart, CartUpdate } from "@/types/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { useStore } from "@/app/store/use-store";

const ShippingAddress = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null }) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState<boolean>(false);
    // const [formData, setFormData] = useState({
    //     label: cart?.shipping_address?.label || "",
    //     address_type: cart?.shipping_address?.address_type || "HOME",
    //     first_name: cart?.shipping_address?.first_name || "",
    //     last_name: cart?.shipping_address?.last_name || "",
    //     address_1: cart?.shipping_address?.address_1 || "",
    //     postal_code: cart?.shipping_address?.postal_code || "",
    //     city: cart?.shipping_address?.city || "",
    //     state: cart?.shipping_address?.state || "",
    //     email: cart?.email || "",
    //     phone: cart?.shipping_address?.phone || "",
    // });
    const [email, setEmail] = useState<string>(cart?.email ?? "");
    const { user } = useStore();

    useEffect(() => {
        setEmail(cart?.email ?? "");
    }, [cart?.email]);

    // const sameAsBilling = cart?.shipping_address && cart?.billing_address ? compareAddresses(cart?.shipping_address, cart?.billing_address) : true;

    const handleSubmit = async () => {
        setIsPending(true);
        // const sameAsBilling = true;

        const updateData: CartUpdate = {
            // shipping_address: {
            //     id: cart?.shipping_address?.id!,
            //     first_name: formData["first_name"],
            //     last_name: formData["last_name"],
            //     address_type: formData["address_type"],
            //     label: formData["label"],
            //     address_1: formData["address_1"],
            //     address_2: "",
            //     postal_code: formData["postal_code"],
            //     city: formData["city"],
            //     state: formData["state"],
            //     phone: formData["phone"],
            //     is_billing: false,
            // },
            email,
        };

        // updateData.billing_address = updateData.shipping_address;

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
            {/* {user && (user.addresses?.length || 0) > 0 && ( */}
            <div className="shadow-xlp w-full rounded-lg mb-6">
                {/* <p className="text-sm">{`Hi ${user.first_name}, do you want to use one of your saved addresses?`}</p> */}
                <AddressSelect cart={cart} />
            </div>
            {/* )} */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <Input
                    required
                    autoComplete="email"
                    data-testid="shipping-email-input"
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
