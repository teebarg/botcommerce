import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Package, Truck } from "lucide-react";

export const Route = createFileRoute("/_mainLayout/(static)/help-center")({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Help Center",
            },
            {
                title: "Help Center",
            },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <div className="bg-linear-to-br from-primary to-secondary text-white">
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-4xl font-bold mb-2">How can we help you?</h1>
                    <p className="text-xl text-blue-100 mb-2">Search for answers or browse our help topics</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-card p-8 rounded-xl shadow-sm border border-input hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                            <MessageCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
                        <p className="text-muted-foreground">Get in touch with our support team for personalized help</p>
                    </div>

                    <div className="bg-card p-8 rounded-xl shadow-sm border border-input hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                            <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Returns & Exchanges</h3>
                        <p className="text-muted-foreground">Learn about our return policy and start a return</p>
                    </div>

                    <div className="bg-card p-8 rounded-xl shadow-sm border border-input hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                            <Truck className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Shipping Info</h3>
                        <p className="text-muted-foreground">Track orders and learn about shipping options</p>
                    </div>
                </div>

                <div className="rounded-xl shadow-sm border border-input p-8">
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: "How do I track my order?", a: "You can track your order using the tracking number sent to your email." },
                            { q: "What is your return policy?", a: "We offer 30-day returns on most items in original condition." },
                            { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days, express takes 1-2 days." },
                            { q: "Do you ship internationally?", a: "Yes, we ship to most countries worldwide with varying delivery times." },
                        ].map((faq, index) => (
                            <details key={index} className="group">
                                <summary className="flex justify-between items-center cursor-pointer p-4 bg-card rounded-lg transition-colors">
                                    <span className="font-medium">{faq.q}</span>
                                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="p-4 text-muted-foreground border-t border-input">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
