"use client";

import { Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

const ContactFormSchema = z.object({
    phone: z
        .string()
        .min(11, { message: "Phone number must be at least 11 digits" })
        .max(13, { message: "Phone number must be less than 13 digits" })
        .regex(/^[0-9+\s()-]+$/, { message: "Please enter a valid phone number" }),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

const CartContactForm = () => {
    const { cart } = useCart();
    const updateCartDetails = useUpdateCartDetails();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: {
            phone: cart?.phone,
        },
    });

    const handleCompleteOrder = form.handleSubmit((data: ContactFormValues) => {
        updateCartDetails.mutateAsync({ phone: data.phone }).then(() => {});
    });

    return (
        <Form {...form}>
            <div>
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">How do we contact you?</FormLabel>
                            <FormControl>
                                <div className="relative flex gap-2 items-center">
                                    <Phone className="absolute z-10 left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input className="pl-10" placeholder="08031234567" {...field} />
                                    <Button disabled={updateCartDetails.isPending || !form.formState.isValid} onClick={handleCompleteOrder}>
                                        {updateCartDetails.isPending ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Form>
    );
};

export default CartContactForm;
