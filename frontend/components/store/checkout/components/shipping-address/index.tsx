"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { useRouter } from "next/navigation";

import AddressSelect from "../address-select";

import { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import CheckoutLoginPrompt from "@/components/generic/auth/checkout-auth-prompt";
import { useAuth } from "@/providers/auth-provider";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";
import ComponentLoader from "@/components/component-loader";

const ShippingAddress = ({ address, email }: { address: Address | null; email: string }) => {
    const router = useRouter();
    const [cartEmail, setCartEmail] = useState<string>(email);
    const { user, loading: meLoading } = useAuth();
    const updateCartDetails = useUpdateCartDetails();

    useEffect(() => {
        setCartEmail(email);
    }, [email]);

    const handleSubmit = async () => {
        updateCartDetails
            .mutateAsync({
                email: cartEmail,
            })
            .then(() => {
                router.push(`/checkout?step=delivery`);
            });
    };

    if (meLoading) {
        return <ComponentLoader className="h-24" />;
    }

    if (!user) {
        return <CheckoutLoginPrompt />;
    }

    return (
        <React.Fragment>
            <div className="w-full rounded-lg mb-6">
                <AddressSelect address={address} />
            </div>
            <React.Fragment>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <Input
                        required
                        autoComplete="email"
                        data-testid="shipping-email-input"
                        label="Email"
                        name="email"
                        type="email"
                        value={cartEmail}
                        onChange={(e) => setCartEmail(e.target.value)}
                    />
                </div>
                <Button
                    aria-label="continue"
                    className="mt-6"
                    data-testid="submit-address-button"
                    disabled={updateCartDetails.isPending || cartEmail === ""}
                    isLoading={updateCartDetails.isPending}
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                >
                    Continue to delivery
                </Button>
            </React.Fragment>
        </React.Fragment>
    );
};

export default ShippingAddress;
