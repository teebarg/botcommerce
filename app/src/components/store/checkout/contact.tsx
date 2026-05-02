import { Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
        <div
            className="p-4 rounded-2xl bg-card border border-border animate-in fade-in slide-in-from-right-4 duration-200"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <Label className="font-semibold">Contact Number</Label>
                    </div>
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative flex gap-2 items-center">
                                        <Input
                                            inputMode="tel"
                                            autoComplete="tel"
                                            className="bg-secondary border-0"
                                            placeholder="0803 123 4567"
                                            value={formatPhone(field.value)}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                const digitsOnly = raw.replace(/\D/g, "");
                                                field.onChange(digitsOnly);
                                            }}
                                        />

                                        <Button type="submit" disabled={updateCartDetails.isPending || !form.formState.isValid}>
                                            {updateCartDetails.isPending ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
};

export default CartContactForm;
