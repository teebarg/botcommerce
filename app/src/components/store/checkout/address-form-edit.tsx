import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { type Address, AddressSchema } from "@/schemas/address";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateAddress } from "@/hooks/useAddress";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { states } from "@/components/store/collections/data";

const addressEditSchema = AddressSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).extend({
    address_2: z.string().optional(),
    is_billing: z.boolean().optional(),
});

type AddressEditFormValues = z.infer<typeof addressEditSchema>;

const ShippingAddressFormEdit = ({ address, onClose }: { address?: Address; onClose?: () => void }) => {
    const updateAddress = useUpdateAddress();

    const defaultValues: AddressEditFormValues = {
        label: address?.label || "Home",
        address_type: "HOME",
        first_name: address?.first_name || "",
        last_name: address?.last_name || "",
        address_1: address?.address_1 || "",
        address_2: address?.address_2 || "",
        city: address?.city || "",
        state: address?.state || "Lagos",
        phone: address?.phone || "",
        is_billing: address?.is_billing ?? false,
    };

    const form = useForm<AddressEditFormValues>({
        resolver: zodResolver(addressEditSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [address]);

    const onSubmit = async (values: AddressEditFormValues) => {
        await updateAddress.mutateAsync({ id: address?.id!, input: values });
        onClose?.();
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto px-2.5 pb-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Label (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Home, Office, Mum's place" {...field} />
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
                                    <Input required autoComplete="given-name" data-testid="shipping-first_name-input" {...field} />
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
                                    <Input required autoComplete="family-name" data-testid="shipping-last_name-input" {...field} />
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
                                    <Input required autoComplete="address-line1" data-testid="shipping-address-input" {...field} />
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
                                        {states.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name}
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
                <div className="sheet-footer">
                    <Button type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={updateAddress.isPending} isLoading={updateAddress.isPending} type="submit">
                        Update
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ShippingAddressFormEdit;
