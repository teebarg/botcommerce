"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/base";
import { Message } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";

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

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
    const [isPending, setIsPending] = useState<boolean>(false);

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

    const onSubmit = async (data: ContactFormValues) => {
        try {
            setIsPending(true);
            const { error } = await api.post<Message>("/contact-form", {
                name: data.name,
                email: data.email,
                message: data.message,
                phone: data.phone,
                subject: data.subject,
            });

            if (error) {
                toast.error(error);

                return;
            }

            toast.success("Message sent successfully");
            form.reset();
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="bg-content2 rounded-lg border border-divider md:p-8 p-4">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-default-foreground mb-2">Send us a Message</h3>
                <p className="text-default-600 text-sm">Fill out the form below and we'll get back to you within 24 hours.</p>
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
                                        <Select onValueChange={(value) => field.onChange(value)} required>
                                            <SelectTrigger className="bg-content1 border-divider focus:border-primary">
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
                                    <FormLabel className="text-sm text-default-500">I allow this website to store my submission.</FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* <Button aria-label="submit" className="min-w-32" disabled={isPending} isLoading={isPending} type="submit" variant="primary">
                        Submit
                    </Button> */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button aria-label="submit" className="flex-1" type="submit" variant="primary" disabled={isPending} isLoading={isPending}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-divider hover:bg-content3"
                            onClick={() => form.reset()}
                        >
                            Clear Form
                        </Button>
                    </div>

                    <p className="text-xs text-default-500 text-center">
                        By submitting this form, you agree to our privacy policy and terms of service.
                    </p>
                </form>
            </Form>
        </div>
    );
}
