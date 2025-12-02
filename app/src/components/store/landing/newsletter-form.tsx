"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useSubscribeNewsletter } from "@/hooks/useGeneric";

const newsletterSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const form = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: { email: "" },
    });

    const { mutateAsync, isPending } = useSubscribeNewsletter();

    const onSubmit = async (data: NewsletterFormValues) => {
        await mutateAsync({ email: data.email });
        setIsSubscribed(true);
        form.reset();
    };

    if (isSubscribed) {
        return (
            <div className="bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 max-w-5xl mx-auto text-center rounded-2xl border border-input p-8 shadow-lg">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Welcome to the Club! 🎉</h2>
                    <p className="text-muted-foreground">You’re now subscribed to our newsletter. Check your inbox for a welcome email!</p>
                </div>
                <div className="bg-card rounded-lg p-4 mb-6 w-fit mx-auto">
                    <Badge className="mb-2">Welcome Bonus</Badge>
                    <p className="text-sm text-muted-foreground">
                        Use code <span className="font-bold text-foreground text-lg">WELCOME15</span> for 15% off your first order.
                    </p>
                </div>
                <Button variant="accent" onClick={() => setIsSubscribed(false)}>
                    Subscribe Another Email
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl border border-input p-8 shadow-lg">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Subscribe Now</h3>
                    <p className="text-muted-foreground text-sm">Get your first exclusive discount code instantly!</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input
                                                className="h-12"
                                                placeholder="Enter your email address"
                                                startContent={<Mail className="text-muted-foreground" />}
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className="w-full" disabled={!form.formState.isValid} isLoading={isPending} size="lg" type="submit">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Subscribe & Get 15% Off
                                </div>
                            </Button>
                        </div>
                    </form>
                </Form>

                <div className="mt-6 pt-6 border-t border-input">
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>No spam</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Unsubscribe anytime</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Privacy protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
