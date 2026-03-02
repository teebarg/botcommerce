import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { states } from "@/components/store/collections/data";
import { useUpdateCartDetails } from "@/hooks/useCart";
import type { Address, CartUpdate } from "@/schemas";
import { checkoutAddressSchema } from "@/lib/validation";

type FormValues = z.infer<typeof checkoutAddressSchema>;

type Props = {
    address?: Address;
    onClose?: () => void;
};

const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    if (digits.startsWith("0")) {
        return `+234${digits.slice(1)}`;
    }

    return digits.startsWith("+") ? digits : `+${digits}`;
};

const CheckoutAddressForm: React.FC<Props> = ({ address, onClose }) => {
    const updateCartDetails = useUpdateCartDetails();

    const form = useForm<FormValues>({
        resolver: zodResolver(checkoutAddressSchema),
        defaultValues: {
            label: address?.label ?? "Home",
            first_name: address?.first_name ?? "",
            last_name: address?.last_name ?? "",
            address_1: address?.address_1 ?? "",
            address_2: address?.address_2 ?? "",
            city: address?.city ?? "",
            state: address?.state ?? "Lagos",
            phone: address?.phone ?? "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        const payload: CartUpdate = {
            shipping_address: {
                ...values,
                address_2: "",
                address_type: "HOME",
                is_billing: false,
                city: "",
            },
        };

        updateCartDetails.mutate(payload);

        onClose?.();
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4 px-3 flex-1 overflow-y-auto pb-4">
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

                    <div className="grid grid-cols-2 gap-3">
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

                <div className="sheet-footer flex gap-3 justify-end p-4 border-t">
                    <Button type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={updateCartDetails.isPending} isLoading={updateCartDetails.isPending}>
                        Continue
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CheckoutAddressForm;
