import { Gift, Zap, Bell } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

const benefits = [
    { icon: Gift, label: "Exclusive deals", desc: "Subscriber-only discounts and early bird offers" },
    { icon: Zap, label: "New arrivals", desc: "First to know about our latest products" },
    { icon: Bell, label: "Flash sales", desc: "Never miss limited-time offers" },
];

export default function NewsletterSection() {
    return (
        <section className="border-t border-border mt-8">
            <div className="max-w-8xl mx-auto px-4 py-16">
                <div className="max-w-xl mb-10">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Newsletter</p>
                    <h2 className="font-display text-2xl font-semibold mb-2">Stay in the loop</h2>
                    <p className="text-sm text-muted-foreground">
                        Join 5,000+ subscribers. Exclusive deals and new arrivals straight to your inbox.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-10">
                    {benefits.map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                            <div className="p-2 rounded-lg bg-secondary shrink-0">
                                <Icon className="h-4 w-4 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <NewsletterForm />
            </div>
        </section>
    );
}