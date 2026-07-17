import { createLazyFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { currency } from "@/utils";

export const Route = createLazyFileRoute("/_mainLayout/_static/shipping")({
    component: RouteComponent,
});

function RouteComponent() {
    const shippingOptions = [
        { name: "Standard shipping", time: "3–5 business days", cost: currency(2500) },
        { name: "Express shipping", time: "1–2 business days", cost: currency(5000) },
        { name: "Store pickup", time: "Available on business days", cost: "Free" },
    ];

    const intlInfo = [
        { icon: "globe", color: "bg-emerald-50 text-emerald-700", label: "We ship worldwide", sub: "Available to most countries" },
        { icon: "clock", color: "bg-blue-50 text-blue-700", label: "7–14 business days", sub: "Delivery time varies by location" },
        { icon: "info", color: "bg-amber-50 text-amber-700", label: "Customs & duties", sub: "May apply based on destination" },
    ];

    const faqs = [
        {
            q: "When will my order ship?",
            a: "Orders placed before 2 PM ship the same business day. Orders placed after 2 PM or on weekends ship the next business day.",
        },
        {
            q: "Do you offer free shipping?",
            a: "We do not offer free shipping on deliveries. You can however select the pickup option at checkout and collect your order directly from our store at no charge.",
        },
        {
            q: "Can I change my shipping address?",
            a: "You can change your shipping address within 1 hour of placing your order. After that, please contact customer service as soon as possible.",
        },
        {
            q: "What if my package is lost or damaged?",
            a: `We"ll replace lost or damaged packages at no cost to you.Contact our support team with your order number and we"ll get it sorted.`,
        },
    ];

    return (
        <div>
            <div className="bg-card border-b">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Delivery</p>
                    <h1 className="text-3xl font-medium mb-2">Shipping Information</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Everything you need to know about shipping, delivery times, and pickup options.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-muted/40 p-5">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Shipping options</p>
                        <div className="divide-y">
                            {shippingOptions.map((opt) => (
                                <div key={opt.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium">{opt.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{opt.time}</p>
                                    </div>
                                    <span className={`text-sm font-medium ${opt.cost === `Free` ? `text-emerald-700` : ``}`}>{opt.cost}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-muted/40 p-5">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">International shipping</p>
                        <div className="divide-y">
                            {intlInfo.map((item) => (
                                <div key={item.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${item.color}`}>
                                        {item.icon === "globe" && <span>🌍</span>}
                                        {item.icon === "clock" && <span>⏱</span>}
                                        {item.icon === "info" && <span>ℹ</span>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Frequently asked questions</p>
                    <div className="divide-y border rounded-xl overflow-hidden">
                        {faqs.map((faq) => (
                            <details key={faq.q} className="group bg-card px-5">
                                <summary className="flex items-center justify-between py-4 cursor-pointer text-sm font-medium list-none">
                                    {faq.q}
                                    <span className="text-muted-foreground transition-transform group-open:rotate-180 ml-4">▾</span>
                                </summary>
                                <p className="text-sm text-muted-foreground leading-relaxed pb-4">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
