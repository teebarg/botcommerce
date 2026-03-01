import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAddress } from "@/hooks/useAddress";
import { states } from "@/components/store/collections/data";
import { phoneSchema } from "@/libs/validation";

const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.startsWith("0")) {
        return digits.replace(/^(\d{4})(\d{3})(\d{0,4})$/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
    }

    if (digits.startsWith("234")) {
        const local = digits.slice(3);
        const formattedLocal = local.replace(/^(\d{3})(\d{3})(\d{0,4})$/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
        return `+234 ${formattedLocal}`.trim();
    }

    return value;
};

const addressSchema = z.object({
    address_type: z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().min(1, "State is required"),
    phone: phoneSchema.optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddAddressFormProps {
    onClose?: () => void;
}

const AddAddressForm: React.FC<AddAddressFormProps> = ({ onClose }) => {
    const createAddress = useCreateAddress();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        mode: "onChange",
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
        await createAddress.mutateAsync(data);
        onClose?.();
        form.reset();
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="overflow-y-auto flex-1 px-4 space-y-4">
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
                                        {states.map((state, idx) => (
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
                                    <Input
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="0803 123 4567"
                                        value={formatPhone(field.value || "")}
                                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3 mt-6 justify-end px-4 py-2 border-t border-border">
                    <Button type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={createAddress.isPending}>
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default AddAddressForm;
