import { Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

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
            phone: cart?.phone || "",
        },
    });

    const handleCompleteOrder = form.handleSubmit((data: ContactFormValues) => {
        updateCartDetails.mutateAsync({ phone: data.phone }).then(() => {});
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-card border border-border"
        >
            <Form {...form}>
                <div>
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
                                        <Input className="bg-secondary border-0" placeholder="08031234567" {...field} />
                                        <Button disabled={updateCartDetails.isPending || !form.formState.isValid} onClick={handleCompleteOrder}>
                                            {updateCartDetails.isPending ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs text-muted-foreground mt-2">We'll send order updates to this number</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>
            </Form>
        </motion.div>
    );
};

export default CartContactForm;
