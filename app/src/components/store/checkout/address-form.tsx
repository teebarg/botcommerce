import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Phone, User } from "lucide-react";

import type { CartUpdate } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { states } from "@/components/store/collections/data";

const formSchema = z.object({
    label: z.string().optional(),
    address_type: z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    phone: z.string().min(11, "Phone is required"),
});

type AddressFormValues = z.infer<typeof formSchema>;

const ShippingAddressForm = ({ onClose }: { onClose?: () => void }) => {
    const updateCartDetails = useUpdateCartDetails();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "",
            address_type: "HOME",
            first_name: "",
            last_name: "",
            address_1: "",
            city: "",
            state: "",
            phone: "",
        },
    });

    const onSubmit = async (values: AddressFormValues) => {
        const updateData: CartUpdate = {
            shipping_address: {
                ...values,
                address_2: "",
                is_billing: false,
            },
        };

        updateData.billing_address = updateData.shipping_address;

        updateCartDetails.mutateAsync(updateData).then(() => {
            onClose?.();
        });
    };

    return (
        <div className="px-2 overflow-y-auto">
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
                                        <Input
                                            data-testid="shipping-first_name-input"
                                            placeholder="e.g., Home, Office, Mum's place"
                                            startContent={<MapPin className="h-4 w-4 text-muted-foreground" />}
                                            {...field}
                                        />
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
                                        <Input
                                            autoComplete="given-name"
                                            data-testid="shipping-first_name-input"
                                            placeholder="Enter your first name"
                                            startContent={<User className="h-4 w-4 text-muted-foreground" />}
                                            {...field}
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
                                            autoComplete="family-name"
                                            data-testid="shipping-last_name-input"
                                            placeholder="Enter your last name"
                                            startContent={<User className="h-4 w-4 text-muted-foreground" />}
                                            {...field}
                                        />
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
                                        <Input
                                            required
                                            autoComplete="address-line1"
                                            data-testid="shipping-address-input"
                                            placeholder="123 Main Street, Apt 4B"
                                            startContent={<MapPin className="h-4 w-4 text-muted-foreground" />}
                                            {...field}
                                        />
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
                                        <Input
                                            required
                                            autoComplete="address-level2"
                                            data-testid="shipping-city-input"
                                            placeholder="City"
                                            startContent={<MapPin className="h-4 w-4 text-muted-foreground" />}
                                            {...field}
                                        />
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
                                            required
                                            autoComplete="tel"
                                            data-testid="shipping-phone-input"
                                            startContent={<Phone className="h-4 w-4 text-muted-foreground" />}
                                            {...field}
                                            placeholder="0800 123 4567"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-8">
                        <Button aria-label="cancel" type="button" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="continue" data-testid="submit-address-button" isLoading={updateCartDetails.isPending} type="submit">
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ShippingAddressForm;
