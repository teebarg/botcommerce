import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { BtnLink } from "@/components/ui/btnLink";

export const Route = createFileRoute("/_mainLayout/(static)/returns")({
    head: () => ({
        meta: [
            { name: "description", content: "Returns & Exchanges Policy" },
            { title: "Returns & Exchanges" },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <div className="bg-card">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                        Store policy
                    </p>
                    <h1 className="text-3xl font-medium">Returns & Exchanges</h1>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        Please read our policy carefully before placing your order. All sales are considered final.
                    </p>
                </div>
            </div>

            <Separator />

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
                {/* No Returns */}
                <div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-5">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm mb-1">No returns accepted</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            We do not accept returns on any items, regardless of the reason. Please make sure you are
                            fully satisfied with your selection before completing your purchase.
                        </p>
                    </div>
                </div>

                {/* No Exchanges */}
                <div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-5">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm mb-1">No exchanges accepted</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Exchanges for different sizes, colors, or items are not available. We encourage you to
                            review product details and sizing guides thoroughly before ordering.
                        </p>
                    </div>
                </div>

                <Separator className="!my-8" />

                {/* FAQ */}
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                    Common questions
                </p>

                <div className="divide-y border rounded-xl overflow-hidden">
                    {[
                        {
                            q: "What if my item arrives damaged or defective?",
                            a: "If your order arrives in a damaged or defective state, please contact our support team within 48 hours of delivery with photos of the issue. Defective item claims are handled on a case-by-case basis.",
                        },
                        {
                            q: "I ordered the wrong size — can I get a replacement?",
                            a: "Unfortunately, we are unable to process size or variant exchanges. We recommend consulting the size guide on each product page before ordering.",
                        },
                        {
                            q: "Can I cancel my order after placing it?",
                            a: "Order cancellations must be requested within 1 hour of purchase and before the order is processed for fulfillment. Once dispatched, an order cannot be cancelled.",
                        },
                    ].map(({ q, a }) => (
                        <div key={q} className="px-5 py-4 bg-card">
                            <p className="font-medium text-sm mb-1">{q}</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-4 !mt-8">
                    <div>
                        <p className="font-medium text-sm">Still have questions?</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Our support team is happy to help</p>
                    </div>
                    <BtnLink href="/contact" size="sm">
                        Contact support
                    </BtnLink>
                </div>
            </div>
        </div>
    );
}