import { Mail, Gift, Zap, Bell } from "lucide-react";

import { NewsletterForm } from "./newsletter-form";

export default function NewsletterSection() {
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
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="bg-card rounded-lg border border-input p-6 text-center hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${benefit.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                                </div>
                                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    <NewsletterForm />
                </div>
            </div>
        </section>
    );
}
