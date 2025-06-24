"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Address } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/apis";
import { AddressTypeSchema } from "@/schemas";
import { states } from "@/components/store/collections/data";

const addressSchema = z.object({
    address_type: AddressTypeSchema,
    label: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    phone: z.string().min(1, "Phone number is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

type EditAddressProps = {
    address: Address;
    isActive?: boolean;
};

const EditAddress: React.FC<EditAddressProps> = ({ address, isActive = false }) => {
    const [removing, setRemoving] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isPending, setIsPending] = useState<boolean>(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            first_name: address.first_name || "",
            last_name: address.last_name || "",
            address_1: address.address_1 || "",
            address_2: address.address_2 || "",
            postal_code: address.postal_code || "",
            city: address.city || "",
            state: address.state || "",
            phone: address.phone || "",
            address_type: address.address_type || "HOME",
            label: address.label || "",
        },
    });

    const onSubmit = async (data: AddressFormValues) => {
        setIsPending(true);
        try {
            await api.address.update(address.id!, data);
            toast.success("Address successfully updated");
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.toString());
        }
        setIsPending(false);
    };

    const removeAddress = async () => {
        setRemoving(true);
        try {
            await api.address.delete(address.id);
            toast.success("Address successfully deleted");
        } catch (error: any) {
            toast.error(error.toString());
        }
        setRemoving(false);
    };

    return (
        <React.Fragment>
            <div
                className={cn(
                    "border border-default-300 rounded-lg p-5 min-h-[200px] h-full w-full flex flex-col justify-between transition-colors",
                    {
                        "border-primary": isActive,
                    }
                )}
                data-testid="address-container"
            >
                <div className="flex flex-col">
                    <h3 className="text-left text-sm font-semibold" data-testid="address-name">
                        {address.first_name} {address.last_name}
                    </h3>
                    <p className="flex flex-col text-left mt-2 font-semibold">
                        <span data-testid="address-address">
                            {address.address_1}
                            {address.address_2 && <span>, {address.address_2}</span>}
                        </span>
                        <span data-testid="address-postal-city">
                            {address.postal_code}, {address.city}
                        </span>
                        <span data-testid="address-state-country">{address.state && `${address.state}`}</span>
                    </p>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button aria-label="edit address" variant="primary" data-testid="address-edit-button" size="icon" onClick={() => setIsOpen(true)}>
                        <Pencil />
                    </Button>
                    <Button
                        aria-label="delete address"
                        data-testid="address-delete-button"
                        disabled={removing}
                        isLoading={removing}
                        size="icon"
                        variant="destructive"
                        onClick={removeAddress}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="address_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address Type</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
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
                                                <Input placeholder="e.g., Home, Office" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-y-2">
                                <div className="grid grid-cols-2 gap-x-2">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First name</FormLabel>
                                                <FormControl>
                                                    <Input required autoComplete="given-name" data-testid="first-name-input" {...field} />
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
                                                    <Input required autoComplete="family-name" data-testid="last-name-input" {...field} />
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
                                                <Input required autoComplete="address-line1" data-testid="address-1-input" {...field} />
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
                                                <Input autoComplete="address-line2" data-testid="address-2-input" {...field} />
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
                                                    <Input required autoComplete="postal-code" data-testid="postal-code-input" {...field} />
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
                                                    <Input required autoComplete="locality" data-testid="city-input" {...field} />
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
                                                <Input autoComplete="phone" data-testid="phone-input" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-3 mt-6 justify-end">
                                <Button
                                    aria-label="cancel"
                                    data-testid="cancel-button"
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button aria-label="update" data-testid="save-button" isLoading={isPending} type="submit" variant="primary">
                                    Update
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default EditAddress;
