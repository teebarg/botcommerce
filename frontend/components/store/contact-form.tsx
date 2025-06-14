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

const contactFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
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
        <Form {...form}>
            <form className="mt-10 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input required placeholder="Ex. John....." {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input required placeholder="Ex. email@email.com" type="email" {...field} />
                            </FormControl>
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
                                <Input placeholder="Ex. 09000000000" type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea required placeholder="Ex. I want to make an enquiry about..." {...field} />
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

                <Button aria-label="submit" className="min-w-32" disabled={isPending} isLoading={isPending} type="submit" variant="primary">
                    Submit
                </Button>
            </form>
        </Form>
    );
}
