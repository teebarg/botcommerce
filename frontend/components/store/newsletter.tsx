"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Input } from "@components/ui/input";

import { Button } from "@/components/ui/button";
import { Message } from "@/schemas";
import { api } from "@/apis/base";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const newsletterSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterForm() {
    const [isPending, setIsPending] = useState<boolean>(false);

    const form = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: NewsletterFormValues) => {
        try {
            setIsPending(true);
            const { error } = await api.post<Message>("/newsletter", {
                email: data.email,
            });

            if (error) {
                toast.error(error);

                return;
            }

            toast.success("Successfully subscribed to newsletter");
            form.reset();
        } catch (error) {
            toast.error("Failed to subscribe to newsletter");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mt-6 sm:flex sm:max-w-lg lg:mt-0 items-center">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input
                                        placeholder="email@gmail.com"
                                        startContent={<Mail className="text-default-500 pointer-events-none shrink-0" />}
                                        type="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="mt-4 sm:ml-4 sm:mt-0 sm:shrink-0">
                        <Button aria-label="subscribe" disabled={isPending} isLoading={isPending} size="sm" type="submit" variant="secondary">
                            Subscribe
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
