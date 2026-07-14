import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/_static/help-center")({
    head: () => ({
        meta: [{ name: "description", content: "Help Center" }, { title: "Help Center" }],
    }),
    component: RouteComponent,
});

const topics = [
    {
        icon: "💬",
        title: "Contact support",
        sub: "Get personalized help from our team",
        href: "/contact",
        color: "bg-blue-50 text-blue-700",
    },
    {
        icon: "📦",
        title: "Returns & exchanges",
        sub: "Understand our return policy",
        href: "/returns",
        color: "bg-emerald-50 text-emerald-700",
    },
    {
        icon: "🚚",
        title: "Shipping info",
        sub: "Track orders and delivery times",
        href: "/shipping",
        color: "bg-violet-50 text-violet-700",
    },
];

const faqs = [
    {
        q: "How do I track my order?",
        a: "You can track your order using the tracking number sent to your email after dispatch. If you haven't received one, please contact our support team.",
    },
    {
        q: "What is your return policy?",
        a: "We do not accept returns or exchanges. All sales are final. If your item arrives damaged or defective, please contact us within 48 hours with photos.",
    },
    {
        q: "How long does shipping take?",
        a: "Standard shipping takes 3–5 business days. Express takes 1–2 business days. International orders typically arrive within 7–14 business days.",
    },
    {
        q: "Do you ship internationally?",
        a: "Yes, we ship to most countries worldwide. Delivery times vary by location and customs duties may apply depending on the destination.",
    },
];

function RouteComponent() {
    return (
        <div>
            <div className="bg-card border-b">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Support</p>
                    <h1 className="text-3xl font-medium mb-2">Help Center</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">Browse help topics or check the FAQ below for quick answers.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Browse topics</p>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {topics.map((t) => (
                        <Link
                            key={t.title}
                            to={t.href}
                            className="rounded-xl border bg-muted/40 p-4 hover:border-border transition-colors group block"
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-base ${t.color}`}>{t.icon}</div>
                            <p className="text-sm font-medium mb-1">{t.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t.sub}</p>
                        </Link>
                    ))}
                </div>

                <Separator className="my-8" />

                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Frequently asked questions</p>
                <div className="divide-y border rounded-xl overflow-hidden">
                    {faqs.map((faq) => (
                        <details key={faq.q} className="group bg-card px-5">
                            <summary className="flex items-center justify-between py-4 cursor-pointer text-sm font-medium list-none">
                                {faq.q}
                                <span className="text-muted-foreground transition-transform group-open:rotate-180 ml-4 flex-shrink-0">▾</span>
                            </summary>
                            <p className="text-sm text-muted-foreground leading-relaxed pb-4">{faq.a}</p>
                        </details>
                    ))}
                </div>

                <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-4 mt-8">
                    <div>
                        <p className="font-medium text-sm">Still need help?</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Our support team usually responds within 24 hours</p>
                    </div>
                    <Link
                        to="/contact-us"
                        className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
                    >
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}
