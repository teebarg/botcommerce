import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { states } from "@/components/store/collections/data";
import { useCreateAddress, useUpdateAddress } from "@/hooks/useAddress";
import { addressSchema } from "@/lib/validations";
import type { Address } from "@/schemas";

type AddressFormValues = z.infer<typeof addressSchema>;

type AddressFormProps = {
    mode: "create" | "edit";
    address?: Address;
    onClose?: () => void;
};

const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return "";

    // Simple international-friendly format
    if (digits.startsWith("234")) {
        return `+${digits}`;
    }

    if (digits.startsWith("0")) {
        return `+234${digits.slice(1)}`;
    }

    return `+${digits}`;
};

const AddressForm: React.FC<AddressFormProps> = ({ mode, address, onClose }) => {
    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            address_type: address?.address_type ?? "HOME",
            first_name: address?.first_name ?? "",
            last_name: address?.last_name ?? "",
            address_1: address?.address_1 ?? "",
            address_2: address?.address_2 ?? "",
            city: address?.city ?? "",
            state: address?.state ?? "",
            phone: address?.phone ?? "",
        },
    });

    const { isDirty } = form.formState;

    // Reset form if address changes (edit mode)
    useEffect(() => {
        if (mode === "edit" && address) {
            form.reset({
                address_type: address.address_type ?? "HOME",
                first_name: address.first_name ?? "",
                last_name: address.last_name ?? "",
                address_1: address.address_1 ?? "",
                address_2: address.address_2 ?? "",
                city: address.city ?? "",
                state: address.state ?? "",
                phone: address.phone ?? "",
            });
        }
    }, [address, mode, form]);

    const onSubmit = async (data: AddressFormValues) => {
        if (mode === "create") {
            await createAddress.mutateAsync(data);
            form.reset();
        }

        if (mode === "edit" && address) {
            await updateAddress.mutateAsync({
                id: address.id!,
                input: data,
            });
        }

        onClose?.();
    };

    const isLoading = mode === "create" ? createAddress.isPending : updateAddress.isPending;

    const isDisabled = isLoading || (mode === "edit" && !isDirty); // disable update if no changes

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="overflow-y-auto flex-1 px-4 space-y-4">
                    {mode === "create" && (
                        <FormField
                            control={form.control}
                            name="address_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                    )}

                    <div className="grid grid-cols-2 gap-x-2">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="given-name" />
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
                                        <Input {...field} autoComplete="family-name" />
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
                                    <Input {...field} autoComplete="address-line1" />
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
                                <FormLabel>Apartment, suite, etc. (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} autoComplete="address-line2" />
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
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {states.map((state) => (
                                            <SelectItem key={state.id} value={state.id}>
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
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        autoComplete="tel"
                                        placeholder="+2348012345678"
                                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-3 mt-6 justify-end px-4 py-2 border-t">
                    <Button type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isDisabled} isLoading={isLoading} className="gradient-primary">
                        {mode === "create" ? "Save" : "Update"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default AddressForm;
