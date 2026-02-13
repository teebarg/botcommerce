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
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    state: z.string().min(1, "State is required"),
    phone: z.string().min(11, "Enter a valid phone number"),
});

type AddressFormValues = z.infer<typeof formSchema>;

const ShippingAddressForm = ({ onClose }: { onClose?: () => void }) => {
    const updateCartDetails = useUpdateCartDetails();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "Home",
            first_name: "",
            last_name: "",
            address_1: "",
            city: "",
            state: "Lagos",
            phone: "",
        },
    });

    const onSubmit = async (values: AddressFormValues) => {
        const updateData: CartUpdate = {
            shipping_address: {
                ...values,
                address_2: "",
                is_billing: false,
                address_type: "HOME",
                city: ""
            },
        };

        updateData.billing_address = updateData.shipping_address;

        updateCartDetails.mutateAsync(updateData).then(() => {
            onClose?.();
        });
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-3 px-2.5 flex-1 overflow-y-auto pb-4">
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

                <div className="sheet-footer">
                    <Button aria-label="cancel" type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button aria-label="continue" data-testid="submit-address-button" isLoading={updateCartDetails.isPending} type="submit">
                        Create
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ShippingAddressForm;
