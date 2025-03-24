"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { states } from "@modules/collections/templates/data";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import AccountInfo from "../account-info";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/apis";

const billingAddressSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    postal_code: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
});

type BillingAddressFormValues = z.infer<typeof billingAddressSchema>;

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileBillingAddress: React.FC<MyInformationProps> = ({ customer }) => {
    const [isPending, setIsPending] = React.useState<boolean>(false);

    const form = useForm<BillingAddressFormValues>({
        resolver: zodResolver(billingAddressSchema),
        defaultValues: {
            first_name: customer.billing_address?.first_name || "",
            last_name: customer.billing_address?.last_name || "",
            address_1: customer.billing_address?.address_1 || "",
            address_2: customer.billing_address?.address_2 || "",
            postal_code: customer.billing_address?.postal_code || "",
            city: customer.billing_address?.city || "",
            state: customer.billing_address?.state || "",
        },
    });

    const clearState = () => {
        form.reset();
    };

    const currentInfo = useMemo(() => {
        if (!customer.billing_address) {
            return "No billing address";
        }

        return (
            <div className="flex flex-col font-semibold" data-testid="current-info">
                <span>
                    {customer.billing_address.first_name} {customer.billing_address.last_name}
                </span>
                <span>
                    {customer.billing_address.address_1}
                    {customer.billing_address.address_2 ? `, ${customer.billing_address.address_2}` : ""}
                </span>
                <span>
                    {customer.billing_address.postal_code}, {customer.billing_address.city}
                </span>
            </div>
        );
    }, [customer]);

    const onSubmit = async (updateData: BillingAddressFormValues) => {
        setIsPending(true);

        const { error } = await api.address.billing(updateData);

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }

        setIsPending(false);
        toast.success("Billing address updated successfully");
    };

    return (
        <Form {...form}>
            <form className="w-full" onReset={() => clearState()} onSubmit={form.handleSubmit(onSubmit)}>
                <AccountInfo
                    clearState={clearState}
                    currentInfo={currentInfo}
                    data-testid="account-billing-address-editor"
                    isLoading={isPending}
                    label="Billing address"
                >
                    <div className="grid grid-cols-1 gap-y-2">
                        <div className="grid md:grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                            <Input required data-testid="billing-first-name-input" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                            <Input required data-testid="billing-last-name-input" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input required data-testid="billing-address-1-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address_2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apartment, suite, etc.</FormLabel>
                                    <FormControl>
                                        <Input data-testid="billing-address-2-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-[144px_1fr] gap-x-2">
                            <FormField
                                control={form.control}
                                name="postal_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Postal code</FormLabel>
                                        <FormControl>
                                            <Input required data-testid="billing-postal-code-input" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input required data-testid="billing-city-input" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <Select data-testid="billing-state-input" defaultValue={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {states.map((state, idx: number) => (
                                                <SelectItem key={idx} value={state.id}>
                                                    {state.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </AccountInfo>
            </form>
        </Form>
    );
};

export default ProfileBillingAddress;
