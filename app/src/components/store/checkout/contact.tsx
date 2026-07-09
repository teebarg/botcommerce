import { Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { formatPhone, normalizePhone } from "@/lib/validation";

const ContactFormSchema = z.object({
    phone: z
        .string()
        .transform((val) => normalizePhone(val))
        .refine((val) => /^234[789][01]\d{8}$/.test(val), {
            message: "Enter a valid mobile number",
        }),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

const CartContactForm = () => {
    const { cart } = useCart();
    const updateCartDetails = useUpdateCartDetails();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(ContactFormSchema),
        mode: "onChange",
        defaultValues: {
            phone: cart?.phone || "",
        },
    });

    const onSubmit = async (data: ContactFormValues) => {
        await updateCartDetails.mutateAsync({
            phone: data.phone,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1 ml-0.5">How do we contact you?</div>
                                    <div className="relative flex gap-2 items-center rounded-xl border border-border py-2 px-4">
                                        <Phone className="w-5 h-5" />
                                        <div className="flex-1">
                                            <Input
                                                inputMode="tel"
                                                autoComplete="tel"
                                                className="border-0 shadow-none focus-visible:ring-0 rounded-none"
                                                placeholder="0803 123 4567"
                                                value={formatPhone(field.value)}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    const digitsOnly = raw.replace(/\D/g, "");
                                                    field.onChange(digitsOnly);
                                                }}
                                            />
                                        </div>
                                        <Button variant="ghost" size="sm" className="bg-transparent text-accent" type="submit" disabled={updateCartDetails.isPending || !form.formState.isValid}>
                                            {updateCartDetails.isPending ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};

export default CartContactForm;
