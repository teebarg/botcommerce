"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContactForm } from "@/lib/hooks/useGeneric";

const contactFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    agreement: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms",
    }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
            agreement: true,
        },
    });

    const { mutateAsync, isPending } = useContactForm();

    const onSubmit = async (data: ContactFormValues) => {
        await mutateAsync(data);
        form.reset();
    };

    return (
        <div className="bg-card rounded-lg border border-input md:p-8 p-4">
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Send us a Message</h3>
                <p className="text-muted-foreground text-sm">{`Fill out the form below and we'll get back to you within 24 hours.`}</p>
            </div>
            <Form {...form}>
                <form className="mt-10 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input required placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input required placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex. 09000000000" type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Select required onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger className="border-input focus:border-primary">
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">General Inquiry</SelectItem>
                                                <SelectItem value="support">Product Support</SelectItem>
                                                <SelectItem value="order">Order Status</SelectItem>
                                                <SelectItem value="return">Returns & Exchanges</SelectItem>
                                                <SelectItem value="partnership">Business Partnership</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <Textarea required placeholder="Tell us how we can help you..." rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="agreement"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm text-muted-foreground">I allow this website to store my submission.</FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button aria-label="submit" className="flex-1" disabled={isPending} isLoading={isPending} type="submit">
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                        </Button>
                        <Button className="flex-1" type="button" variant="outline" onClick={() => form.reset()}>
                            Clear Form
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        By submitting this form, you agree to our privacy policy and terms of service.
                    </p>
                </form>
            </Form>
        </div>
    );
}
