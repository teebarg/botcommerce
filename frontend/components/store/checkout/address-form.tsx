"use client";

import React, { useState } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CartUpdate } from "@/types/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    label: z.string().optional(),
    address_type: z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    phone: z.string().min(11, "Phone is required"),
});

type AddressFormValues = z.infer<typeof formSchema>;

const ShippingAddressForm = ({ onClose }: { onClose?: () => void }) => {
    const queryClient = useQueryClient();
    const [isPending, setIsPending] = useState<boolean>(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "",
            address_type: "HOME",
            first_name: "",
            last_name: "",
            address_1: "",
            postal_code: "",
            city: "",
            state: "",
            phone: "",
        },
    });

    const onSubmit = async (values: AddressFormValues) => {
        setIsPending(true);

        const updateData: CartUpdate = {
            shipping_address: {
                ...values,
                address_2: "",
                is_billing: false,
            },
        };

        updateData.billing_address = updateData.shipping_address;

        const { error } = await api.cart.updateDetails(updateData);

        setIsPending(false);

        if (error) {
            toast.error(error);

            return;
        }

        queryClient.invalidateQueries({ queryKey: ["user-address"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        onClose?.();
    };

    return (
        <div className="py-6 px-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-default-900 mb-4">Shipping Address</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="address_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Type</FormLabel>
                                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="HOME">Home</SelectItem>
                                            <SelectItem value="WORK">Work</SelectItem>
                                            <SelectItem value="BILLING">Billing</SelectItem>
                                            <SelectItem value="SHIPPING">Shipping</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label (Optional)</FormLabel>
                                    <FormControl>
                                        <Input data-testid="shipping-first_name-input" placeholder="e.g., Home, Office" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="given-name" data-testid="shipping-first_name-input" {...field} />
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
                                        <Input autoComplete="family-name" data-testid="shipping-last_name-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="address-line1" data-testid="shipping-address-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postal_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postal code</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="postal-code" data-testid="shipping-postal-code-input" {...field} />
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
                                        <Input autoComplete="address-level2" data-testid="shipping-city-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger data-testid="shipping-state-input">
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {["Abuja", "Lagos", "Rivers", "Oyo"].map((item: string, idx: number) => (
                                                <SelectItem key={idx} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="tel" data-testid="shipping-phone-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-8">
                        <Button aria-label="cancel" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="continue" data-testid="submit-address-button" isLoading={isPending} type="submit" variant="primary">
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ShippingAddressForm;
