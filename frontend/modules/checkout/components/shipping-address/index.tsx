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
    const [email, setEmail] = useState<string>(cart?.email ?? "");
    const { user } = useStore();

    useEffect(() => {
        setEmail(cart?.email ?? "");
    }, [cart?.email]);

    const handleSubmit = async () => {
        setIsPending(true);

        const updateData: CartUpdate = {
            email,
        };

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
            <div className="w-full rounded-lg mb-6">
                <AddressSelect cart={cart} />
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
            )}
        </React.Fragment>
    );
};

export default ShippingAddress;
