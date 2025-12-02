"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAddress } from "@/lib/hooks/useAddress";
import { states } from "@/components/store/collections/data";

const addressSchema = z.object({
    address_type: z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    phone: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddAddressFormProps {
    onClose?: () => void;
}

const AddAddressForm: React.FC<AddAddressFormProps> = ({ onClose }) => {
    const createAddress = useCreateAddress();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            address_type: "HOME",
            first_name: "",
            last_name: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "Lagos",
            phone: "",
        },
    });

    const onSubmit = async (data: AddressFormValues) => {
        createAddress.mutateAsync(data).then(() => {
            onClose?.();
            form.reset();
        });
    };

    return (
        <div className="px-2 md:px-4 pt-4">
            <h2 className="text-lg font-semibold mb-4">Add new address</h2>
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-y-2">
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
                        <div className="grid grid-cols-2 gap-x-2">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                            <Input
                                                required
                                                autoComplete="given-name"
                                                data-testid="first-name-input"
                                                {...field}
                                                placeholder="First name"
                                            />
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
                                            <Input
                                                required
                                                autoComplete="family-name"
                                                data-testid="last-name-input"
                                                {...field}
                                                placeholder="Last name"
                                            />
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
                                        <Input required autoComplete="address-line1" data-testid="address-1-input" {...field} placeholder="Address" />
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
                                        <Input
                                            autoComplete="address-line2"
                                            data-testid="address-2-input"
                                            {...field}
                                            placeholder="Apartment, suite, etc."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-[144px_1fr] gap-x-2">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input required autoComplete="locality" data-testid="city-input" {...field} placeholder="City" />
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
                                    <Select data-testid="state-input" defaultValue={field.value} onValueChange={field.onChange}>
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
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="phone" data-testid="phone-input" {...field} placeholder="Phone" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-3 mt-6 justify-end">
                        <Button aria-label="cancel" data-testid="cancel-button" type="button" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="save" data-testid="save-button" isLoading={createAddress.isPending} type="submit">
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AddAddressForm;
