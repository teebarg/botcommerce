import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { tryCatch } from "@/utils/try-catch";
import type { Message } from "@/schemas";
import { useConfig } from "@/providers/store-provider";
import { api } from "@/utils/api";
import { cn } from "@/utils";

export const Route = createFileRoute("/_mainLayout/bulk")({
    component: RouteComponent,
});

const bulkPurchaseSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email(),
    phone: z.string().min(1, "Phone number is required"),
    bulkType: z.string().min(1, "Please select a bulk option"),
    quantity: z.string().optional(),
    message: z.string().optional(),
});

type BulkPurchaseFormValues = z.infer<typeof bulkPurchaseSchema>;

const bulkOptions = [
    {
        id: "slots",
        name: "Slots",
        description: "Perfect for small retailers and boutiques",
        minQuantity: "20+ pieces",
        discount: "15–25% off",
        popular: false,
    },
    {
        id: "quarter-bale",
        name: "Quarter Bale",
        description: "Ideal for growing businesses",
        minQuantity: "100+ pieces",
        discount: "25–35% off",
        popular: true,
    },
    {
        id: "half-bale",
        name: "Half Bale",
        description: "Great for established retailers",
        minQuantity: "200+ pieces",
        discount: "35–45% off",
        popular: false,
    },
    {
        id: "full-bale",
        name: "Full Bale",
        description: "Maximum savings for large operations",
        minQuantity: "400+ pieces",
        discount: "45–60% off",
        popular: false,
    },
];

const benefits = [
    "Competitive wholesale pricing",
    "Quality assurance guarantee",
    "Fast shipping nationwide",
    "Dedicated account manager",
    "Flexible payment terms",
    "Custom packaging options",
];

function RouteComponent() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const config = useConfig();

    const form = useForm<BulkPurchaseFormValues>({
        resolver: zodResolver(bulkPurchaseSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            bulkType: "slots",
            quantity: "",
            message: "",
        },
    });

    const selectedBulkType = form.watch("bulkType");

    const onSubmit = async (formData: BulkPurchaseFormValues) => {
        setIsSubmitting(true);
        const { error } = await tryCatch<Message>(api.post<Message>("/bulk-purchase", formData));
        setIsSubmitting(false);

        if (error) {
            toast.error("Submission failed", {
                description: "Please try again later",
            });
            return;
        }

        toast.success("Interest submitted!", {
            description: "We'll get back to you within 24 hours with a custom quote",
        });
        form.reset();
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="pb-8 border-b border-border">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    Wholesale & bulk orders
                </p>
                <h1 className="text-3xl font-medium text-foreground mb-2">
                    Scale your business with bulk fashion
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-6">
                    From slots to full bales, we offer competitive wholesale pricing for retailers, boutiques, and fashion entrepreneurs.
                </p>
                <div className="flex flex-wrap gap-5">
                    {[
                        "Minimum 20 pieces",
                        "Up to 60% off",
                        "24hr response time",
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-success shrink-0" />
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="pt-8 grid lg:grid-cols-2 gap-12">

                {/* Left — options + benefits */}
                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                        Choose your option
                    </p>

                    <div className="flex flex-col gap-3 mb-8">
                        {bulkOptions.map((option) => {
                            const isSelected = selectedBulkType === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => form.setValue("bulkType", option.id)}
                                    className={cn(
                                        "w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-150",
                                        isSelected
                                            ? "border-foreground border-[1.5px] bg-card"
                                            : "border-border bg-card hover:border-border/80"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-medium text-foreground">{option.name}</span>
                                                {option.popular && (
                                                    <span className="text-xxs font-medium bg-warning-subtle text-warning-subtle-foreground px-2 py-0.5 rounded-full">
                                                        Popular
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{option.description}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground/60">{option.minQuantity}</span>
                                        <span className="text-xs font-medium text-foreground">{option.discount}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-border pt-6">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                            Why bulk with us
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {benefits.map((benefit) => (
                                <div key={benefit} className="flex items-center gap-2.5">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                    <span className="text-sm text-muted-foreground">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — form */}
                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                        Get your quote
                    </p>

                    <div className="border border-border rounded-xl p-6">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            Fill out the form and we'll get back to you with a personalised quote within 24 hours.
                        </p>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your name" {...field} />
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
                                                    <Input placeholder="you@email.com" type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+234 800 000 0000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated quantity</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 200 pieces per month" {...field} />
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
                                            <FormLabel>Additional details</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about your business, preferred styles, timeline, etc."
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={!selectedBulkType || isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit & get quote"}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                                Need help now?
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                    <span>{config?.contact_phone}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                    <span>{config?.contact_email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span>{config?.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}