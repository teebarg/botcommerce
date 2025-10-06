"use client";

import { Mail, Gift, Zap, Bell, CheckCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useSubscribeNewsletter } from "@/lib/hooks/useGeneric";

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

    const { mutateAsync, isPending } = useSubscribeNewsletter();

    const onSubmit = async (data: NewsletterFormValues) => {
        await mutateAsync({ email: data.email });

        setIsSubscribed(true);
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
            color: "text-emerald-600",
            bgColor: "bg-emerald-600/10",
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
            <section className="py-16">
                <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 max-w-5xl mx-auto text-center rounded-2xl border border-input p-8 shadow-lg">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome to the Club! 🎉</h2>
                        <p className="text-muted-foreground">
                            {`You're now subscribed to our newsletter. Check your inbox for a welcome email with your exclusive discount code!`}
                        </p>
                    </div>

                    <div className="bg-card rounded-lg p-4 mb-6 w-fit mx-auto">
                        <Badge className="mb-2">
                            Welcome Bonus
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                            Use code <span className="font-outfit font-bold text-foreground text-lg">WELCOME15</span> for 15% off your first order
                        </p>
                    </div>

                    <Button variant="accent" onClick={() => setIsSubscribed(false)}>
                        Subscribe Another Email
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-input mb-4">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Newsletter</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Stay in the Loop</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Join over 5,000+ subscribers and get exclusive deals, product updates, and insider tips delivered straight to your inbox.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {benefits.map((benefit, idx: number) => (
                            <div
                                key={idx}
                                className="bg-card rounded-lg border border-input p-6 text-center hover:shadow-md transition-shadow"
                            >
                                <div className={`w-12 h-12 ${benefit.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                                </div>
                                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl border border-input p-8 shadow-lg">
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
                                                            startContent={<Mail className="text-muted-foreground pointer-events-none shrink-0" />}
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
                                            disabled={!form.formState.isValid}
                                            isLoading={isPending}
                                            size="lg"
                                            type="submit"
                                        >
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
                                        <CheckCircle className="h-3 w-3 text-accent" />
                                        <span>No spam</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-accent" />
                                        <span>Unsubscribe anytime</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-accent" />
                                        <span>Privacy protected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
