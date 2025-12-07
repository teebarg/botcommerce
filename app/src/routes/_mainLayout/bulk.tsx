import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { Package, Truck, Users, CheckCircle, Phone, Mail, MapPin, Dot } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { tryCatch } from "@/lib/try-catch";
import { Message } from "@/schemas";
import { api } from "@/utils/fetch-api";
import { useConfig } from "@/providers/store-provider";
import { bulkRequestFn } from "@/server/generic.server";

export const Route = createFileRoute("/_mainLayout/bulk")({
    component: RouteComponent,
});

const bulkPurchaseSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.email(),
    phone: z.string().min(1, "Phone number is required"),
    bulkType: z.string().min(1, "Please select a bulk option"),
    quantity: z.string().optional(),
    message: z.string().optional(),
});

type BulkPurchaseFormValues = z.infer<typeof bulkPurchaseSchema>;

function RouteComponent() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { config } = useConfig();

    const form = useForm<BulkPurchaseFormValues>({
        resolver: zodResolver(bulkPurchaseSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            bulkType: "quarter-bale",
            quantity: "",
            message: "",
        },
    });

    const bulkOptions = [
        {
            id: "slots",
            name: "Slots",
            description: "Perfect for small retailers and boutiques",
            minQuantity: "20+ pieces",
            discount: "15-25% off",
            icon: Package,
            popular: false,
        },
        {
            id: "quarter-bale",
            name: "Quarter Bale",
            description: "Ideal for growing businesses",
            minQuantity: "100+ pieces",
            discount: "25-35% off",
            icon: Package,
            popular: true,
        },
        {
            id: "half-bale",
            name: "Half Bale",
            description: "Great for established retailers",
            minQuantity: "200+ pieces",
            discount: "35-45% off",
            icon: Truck,
            popular: false,
        },
        {
            id: "full-bale",
            name: "Full Bale",
            description: "Maximum savings for large operations",
            minQuantity: "400+ pieces",
            discount: "45-60% off",
            icon: Users,
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

    const handleBulkTypeSelect = (bulkType: string) => {
        form.setValue("bulkType", bulkType);
    };

    const onSubmit = async (formData: BulkPurchaseFormValues) => {
        setIsSubmitting(true);
        const { error } = await tryCatch<Message>(bulkRequestFn({ data: formData }));

        setIsSubmitting(false);

        if (error) {
            toast.error("Submission Failed", {
                description: error || "Please try again later",
            });

            return;
        }

        toast.success("Interest Submitted!", {
            description: "We'll get back to you within 24 hours with a custom quote",
        });
        form.reset();
    };
    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/10">
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <Badge className="mb-4" variant="contrast">
                        Wholesale & Bulk Orders
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent mb-6">
                        Scale Your Business with Bulk Fashion
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        From slots to full bales, we offer competitive wholesale pricing for retailers, boutiques, and fashion entrepreneurs. Save
                        more when you buy more.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Minimum 20 pieces</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Up to 40% discount</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>24hr response time</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Choose Your Bulk Option</h2>
                        <div className="grid gap-4">
                            {bulkOptions.map((option, idx: number) => {
                                const IconComponent = option.icon;
                                const isSelected = form.watch("bulkType") === option.id;

                                return (
                                    <Card
                                        key={idx}
                                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${
                                            isSelected ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30"
                                        } ${option.popular ? "ring-1 ring-accent/20" : ""}`}
                                        onClick={() => handleBulkTypeSelect(option.id)}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-lg ${
                                                            isSelected ? "bg-primary text-primary-foreground" : "bg-background"
                                                        }`}
                                                    >
                                                        <IconComponent className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{option.name}</CardTitle>
                                                        <CardDescription>{option.description}</CardDescription>
                                                    </div>
                                                </div>
                                                {option.popular && (
                                                    <Badge className="bg-contrast text-contrast-foreground" variant="default">
                                                        Popular
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{option.minQuantity}</p>
                                                    <p className="font-semibold text-primary">{option.discount}</p>
                                                </div>
                                                {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                    Why Choose Our Bulk Program?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Dot className="w-4 h-4 text-contrast shrink-0" />
                                            <span className="text-sm">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="sticky top-8">
                            <CardHeader>
                                <CardTitle>Get Your Custom Quote</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we will get back to you with a personalized quote within 24 hours
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter your full name" {...field} />
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
                                                        <FormLabel>Email *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter your email" type="email" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter your phone number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estimated Quantity Needed</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 200 pieces per month" {...field} />
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
                                                    <FormLabel>Additional Details</FormLabel>
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

                                        {!form.watch("bulkType") && (
                                            <p className="text-sm text-muted-foreground">* Please select a bulk option above</p>
                                        )}

                                        <Button className="w-full" disabled={!form.watch("bulkType") || isSubmitting} size="lg" type="submit">
                                            {isSubmitting ? "Submitting..." : "Submit Interest & Get Quote"}
                                        </Button>
                                    </form>
                                </Form>

                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-semibold mb-3">Need immediate assistance?</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <span>{config?.contact_phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            <span>{config?.contact_email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span>{config?.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
