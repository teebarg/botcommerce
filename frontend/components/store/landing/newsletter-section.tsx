"use client";

import { Mail, Gift, Zap, Bell, CheckCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "@/schemas";
import { api } from "@/apis/base";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const newsletterSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const NewsletterSection: React.FC = () => {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

    const form = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: NewsletterFormValues) => {
        const { error } = await api.post<Message>("/newsletter", {
            email: data.email,
        });

        if (error) {
            toast.error(error);

            return;
        }

        setIsSubscribed(true);
        toast.success("Successfully subscribed to newsletter");
        form.reset();
    };

    const benefits = [
        {
            icon: Gift,
            title: "Exclusive Deals",
            description: "Get access to subscriber-only discounts and early bird offers",
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            icon: Zap,
            title: "New Arrivals",
            description: "Be the first to know about our latest products and collections",
            color: "text-secondary",
            bgColor: "bg-secondary/10",
        },
        {
            icon: Bell,
            title: "Flash Sales",
            description: "Never miss limited-time offers and flash sale notifications",
            color: "text-warning",
            bgColor: "bg-warning/10",
        },
    ];

    if (isSubscribed) {
        return (
            <section className="py-16 bg-gradient-to-br from-secondary/5 to-primary/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-content1 rounded-2xl border border-divider p-8 shadow-lg">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-secondary" />
                                </div>
                                <h2 className="text-2xl font-bold text-default-foreground mb-2">Welcome to the Club! 🎉</h2>
                                <p className="text-default-600">
                                    {`You're now subscribed to our newsletter. Check your inbox for a welcome email with your exclusive discount code!`}
                                </p>
                            </div>

                            <div className="bg-content2 rounded-lg p-4 mb-6">
                                <Badge className="bg-secondary text-secondary-foreground mb-2">Welcome Bonus</Badge>
                                <p className="text-sm text-default-600">
                                    Use code <span className="font-mono font-bold text-default-foreground">WELCOME15</span> for 15% off your first
                                    order
                                </p>
                            </div>

                            <Button className="border-divider hover:bg-content2" variant="outline" onClick={() => setIsSubscribed(false)}>
                                Subscribe Another Email
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-content1 rounded-full px-4 py-2 border border-divider mb-4">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-default-foreground">Newsletter</span>
                        </div>
                        <h2 className="text-3xl font-bold text-default-foreground mb-4">Stay in the Loop</h2>
                        <p className="text-default-600 text-lg max-w-2xl mx-auto">
                            Join over 50,000+ subscribers and get exclusive deals, product updates, and insider tips delivered straight to your inbox.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-content1 rounded-lg border border-divider p-6 text-center hover:shadow-md transition-shadow"
                            >
                                <div className={`w-12 h-12 ${benefit.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                                </div>
                                <h3 className="font-semibold text-default-foreground mb-2">{benefit.title}</h3>
                                <p className="text-sm text-default-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-content1 rounded-2xl border border-divider p-8 shadow-lg">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-default-foreground mb-2">Subscribe Now</h3>
                                <p className="text-default-600 text-sm">Get your first exclusive discount code instantly!</p>
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
                                                            className="bg-content2 h-12"
                                                            placeholder="Enter your email address"
                                                            startContent={<Mail className="text-default-500 pointer-events-none shrink-0" />}
                                                            type="email"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            className="w-full"
                                            disabled={form.formState.isSubmitting || !form.formState.isValid}
                                            isLoading={form.formState.isSubmitting}
                                            size="lg"
                                            type="submit"
                                            variant="primary"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Subscribe & Get 15% Off
                                            </div>
                                        </Button>
                                    </div>
                                </form>
                            </Form>

                            <div className="mt-6 pt-6 border-t border-divider">
                                <div className="flex items-center justify-center gap-4 text-xs text-default-500">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-secondary" />
                                        <span>No spam</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-secondary" />
                                        <span>Unsubscribe anytime</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-secondary" />
                                        <span>Privacy protected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-default-600">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full border-2 border-content1 flex items-center justify-center text-xs font-bold text-white"
                                    >
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                                <div className="w-8 h-8 bg-content2 border-2 border-content1 rounded-full flex items-center justify-center text-xs font-bold text-default-600">
                                    +
                                </div>
                            </div>
                            <span>Join 50,000+ happy subscribers</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
