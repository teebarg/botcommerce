"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AddressSelect from "../address-select";

import { Address } from "@/types/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { useMe } from "@/lib/hooks/useApi";

const ShippingAddress = ({ address, email }: { address: Address | null; email: string }) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState<boolean>(false);
    const [cartEmail, setCartEmail] = useState<string>(email);
    const { data: user, isLoading: meLoading } = useMe();

    useEffect(() => {
        setCartEmail(email);
    }, [email]);

    const handleSubmit = async () => {
        setIsPending(true);

        const { error } = await api.cart.updateDetails({
            email: cartEmail,
        });

        setIsPending(false);

        if (error) {
            toast.error(error);

            return;
        }

        router.push(`/checkout?step=delivery`);
    };

    if (meLoading) {
        return null;
    }

    return (
        <React.Fragment>
            <div className="w-full rounded-lg mb-6">
                <AddressSelect address={address} user={user!} />
            </div>
            {user && (
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
                        disabled={isPending || cartEmail === ""}
                        isLoading={isPending}
                        type="button"
                        onClick={handleSubmit}
                    >
                        Continue to delivery
                    </Button>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default ShippingAddress;
