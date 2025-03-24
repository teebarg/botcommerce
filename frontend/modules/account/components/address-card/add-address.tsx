"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "nui-react-icons";
import { states } from "@modules/collections/templates/data";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/apis";

const addressSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    postal_code: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    phone: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const AddAddress = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isPending, setIsPending] = useState<boolean>(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            address_1: "",
            address_2: "",
            postal_code: "",
            city: "",
            state: "",
            phone: "",
        },
    });

    const onSubmit = async (data: AddressFormValues) => {
        setIsPending(true);
        try {
            await api.address.create(data);
            toast.success("Address successfully created");
            setIsOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.toString());
        }
        setIsPending(false);
    };

    return (
        <>
            <button
                aria-label="add address"
                className="border border-default-100 rounded-lg p-5 min-h-[200px] flex flex-col justify-between"
                data-testid="add-address-button"
                onClick={() => setIsOpen(true)}
            >
                <span className="font-semibold">New address</span>
                <Plus />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add new address</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                            <div className="flex gap-3 mt-6">
                                <Button
                                    aria-label="cancel"
                                    className="min-w-32"
                                    data-testid="cancel-button"
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button aria-label="save" className="min-w-32" data-testid="save-button" isLoading={isPending} type="submit">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddAddress;
